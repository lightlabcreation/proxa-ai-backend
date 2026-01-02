const db = require('../../../config/config');
const intake_request_approvers = db.intake_request_approvers;
const intake_request = db.intake_request
const user = db.user
const { Sequelize } = require('sequelize');
const create_approver_request = async (req, res) => {
    try {
        const { intakeRequestId, userId, status, comments } = req.body;

        if (!intakeRequestId || !userId) {
            return res.status(400).json({ message: 'intakeRequestId and userId are required.' });
        }

        const newApprover = await intake_request_approvers.create({
            intakeRequestId,
            userId,
            status: status || 'pending',
            comments,
        });

        res.status(201).json({
            message: 'Request added successfully!',
            approver: newApprover,
        });
    } catch (error) {
        console.error('Error creating Request:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const get_all_approvers_request = async (req, res) => {
    try {
        const approvers = await intake_request_approvers.findAll({
            include: [
                {
                    model: intake_request,
                    as: 'intakeRequest',
                    include: [
                        {
                            model: db.department,
                            as: 'department',
                            attributes: ['id', 'name'],
                        },
                        {
                            model: db.category,
                            as: 'category',
                            attributes: ['id', 'name'],
                        },
                    ],
                    attributes: [
                        ['id', 'intakeRequestId'],
                        'createdAt',
                    ],
                },
                {
                    model: user,
                    as: 'userDetails',
                    attributes: [['id', 'userId'], 'first_name'],
                },
            ],
            attributes: [
                'intakeRequestId',
                [Sequelize.fn('COUNT', Sequelize.col('intake_request_approvers.id')), 'approverCount'],
                'status', // Include the status field
            ],
            group: [
                'intakeRequestId',
                'intakeRequest.id',
                'intakeRequest.createdAt',
                'intakeRequest.department.id',
                'intakeRequest.department.name',
                'intakeRequest.category.id',
                'intakeRequest.category.name',
                'userDetails.id',
                'userDetails.first_name',
                'intake_request_approvers.status', // Group by status
            ],
            raw: true,
        });

        // Transform data into structured JSON response
        const groupedData = approvers.reduce((result, approver) => {
            const intakeRequestId = approver['intakeRequest.intakeRequestId'];

            if (!result[intakeRequestId]) {
                result[intakeRequestId] = {
                    intakeRequestId,
                    categoryId: approver['intakeRequest.category.id'] || null,
                    categoryName: approver['intakeRequest.category.name'] || null,
                    createdAt: approver['intakeRequest.createdAt'],
                    departmentName: approver['intakeRequest.department.name'] || null,
                    approverCount: 0,
                    approved: [],
                    rejected: [],
                    pending: [],
                };
            }

            const userDetail = {
                userId: approver['userDetails.userId'],
                firstName: approver['userDetails.first_name'],
            };

            if (approver.status === 'approved') {
                result[intakeRequestId].approved.push(userDetail);
            } else if (approver.status === 'rejected') {
                result[intakeRequestId].rejected.push(userDetail);
            } else {
                result[intakeRequestId].pending.push(userDetail);
            }

            result[intakeRequestId].approverCount += 1;
            return result;
        }, {});

        const response = Object.values(groupedData);

        if (response.length === 0) {
            return res.status(404).json({
                message: 'No Requests found.',
            });
        }

        res.status(200).json({
            message: 'All Requests retrieved successfully!',
            requests: response,
        });
    } catch (error) {
        console.error('Error fetching Requests:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
  
const update_approver_request = async (req, res) => {
    try {
        const { id } = req.params;

        const approver = await intake_request_approvers.findByPk(id);
        if (!approver) {
            return res.status(404).json({ message: 'Request not found.' });
        }

        await approver.update(req.body);

        res.status(200).json({
            message: 'Request updated successfully!',
            approver,
        });
    } catch (error) {
        console.error('Error updating Request:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const delete_approver_request = async (req, res) => {
    try {
        const { id } = req.params;

        const approver = await intake_request_approvers.findByPk(id);
        if (!approver) {
            return res.status(404).json({ message: 'Approver not found.' });
        }

        await approver.destroy();

        res.status(200).json({ message: 'Approver deleted successfully!' });
    } catch (error) {
        console.error('Error deleting approver:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const approver_flow = async (req, res) => {
    try {
      const { id } = req.params; // Extract request ID from params
  
      if (!id) {
        return res.status(400).json({ message: "Request ID is required." });
      }
  
      // Step 1: Retrieve the approvers and their department details from intake_request_approvers table
      const approvers = await db.intake_request_approvers.findAll({
        where: { intakeRequestId: id },
        attributes: ['intakeRequestId', 'userId', 'status'], // Fetch necessary fields
        include: [
          {
            model: db.department, // Fetch department where user exists
            as: 'departmentDetails',
            attributes: ['name' ],
            required: false, // Allow cases where a user might not belong to any department
          },
        ],
      });
  
      if (!approvers.length) {
        return res.status(404).json({ message: "No approver flow found for the given request ID." });
      }
  
      // Step 2: Retrieve comments for each approver
      const approverDataPromises = approvers.map(async (approver) => {
        // Retrieve comments for the approver from intake_request_comment
        const comments = await db.intake_request_comment.findAll({
          where: {
            requestId: id,
          },
          attributes: ['commentMessage'],
        });
  
        // Step 3: Format the response data for the approver
        return {
          intakeRequestId: approver.intakeRequestId,
          userId: approver.userId,
          status: approver.status || 'pending', // Status from intake_request_approvers
          comments: comments.length > 0 ? comments[0].commentMessage : 'No Comment', // Single comment message
          departmentName: approver.departmentDetails?.name || 'N/A', // Department name
        };
      });
  
      // Wait for all the promises to resolve for approver data
      const approverData = await Promise.all(approverDataPromises);
  
      // Step 3: Retrieve the status of the intake request
      const intakeRequest = await db.intake_request.findOne({
        where: { id },
        attributes: ['assignStatus'], // Get the status of the intake request
      });
  
      // Check if intake request exists
      if (!intakeRequest) {
        return res.status(404).json({ message: "Intake request not found." });
      }
  
      // Step 4: If assignStatus is true, find supplier and contract details
      let supplierContractDetails = null;
      if (intakeRequest.assignStatus === true) {
        // Find the supplierId from the assign_intake_request table
        const assignRequest = await db.assign_intake_request.findOne({
          where: { requestId: id },
          attributes: ['supplierId'], // Fetch the supplierId
        });
  
        if (assignRequest) {
          const supplierId = assignRequest.supplierId;
  
          // Find the contract using the supplierId
          const contract = await db.contract.findOne({
            where: { supplierId },
            attributes: ['id', 'contractName'], // Assuming you have these fields
          });
  
          if (contract) {
            supplierContractDetails = {
               assignContract :true 
            };
          }
        }
      }
  
      // Step 5: Retrieve procurement details ONLY for the given intakeRequestId (matching the request ID)
      const procurementDetails = await db.procurement_request_approvers.findAll({
        where: { intakeRequestId: id }, // Ensure that it matches the given request ID
        attributes: ['userId', 'status'], // Get the necessary fields
      });
  
      // Format procurement details response
      const procurementFormattedDetails = procurementDetails.map((procurementApprover) => ({
        userId: procurementApprover.userId,
        procurementStatus: procurementApprover.status || 'pending',
        heading: 'Procurement Review', // Heading if procurement exists
      }));
  
      // Send the response with intake request status, approvers, procurement details, and contract details
      res.status(200).json({
        message: 'Requests flow retrieved successfully!',
        supplierAssignStatus: intakeRequest.assignStatus, // Include the intake request status
        requests: approverData,
        procurementDetails: procurementFormattedDetails, // Separate procurement details section
        supplierContractDetails, // Include supplier and contract details if available
      });
    } catch (error) {
      console.error("Error retrieving requests flow:", error);
      res.status(500).json({
        message: "An error occurred while retrieving requests flow.",
        error: error.message,
      });
    }
  };
    module.exports = {
    create_approver_request,
    get_all_approvers_request,
    update_approver_request,
    delete_approver_request,
    approver_flow
};
