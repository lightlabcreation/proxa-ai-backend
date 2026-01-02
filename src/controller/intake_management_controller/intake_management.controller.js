const db = require("../../../config/config");
const intakeRequest = db.intake_request;
const assignIntakeRequest = db.assign_intake_request;
const Supplier = db.supplier;
const department = db.department;
const intake_request_comment = db.intake_request_comment;
const intake_request_approvers = db.intake_request_approvers;
const procurement_request_approvers = db.procurement_request_approvers;
const Category = db.category;
const Subcategory = db.subcategories;
const User = db.user;
const { Op } = require("sequelize"); // Needed for Op.ne

const add_intake_request = async (req, res) => {
  const userId = req.user.id;

  try {
    let {
      requestType,
      category,
      subcategory,
      engagementType,
      itemDescription,
      quantity,
      duration,
      expectedDeliveryDate,
      executionTimeline,
      reasonForEarlierExecution,
      serviceDuration,
      amendmentType,
      budgetCode,
      requestedAmount,
      requesterName,
      requesterDepartmentId,
      requesterEmail,
      requesterContactNumber,
      additionalDescription,
      authorizedSignatory,
      suppliersCountry,
      subcontractorInvolved,
      subcontractorInfo,
      vendor,
      contract,
      helpDescription,
      whatToBuy,
      addLicenseToExistingProduct,
      involvesCloud,
      shareCustomerOrEmployeeInfo,
      status,
      supplierEmail,
      supplierName,
      supplierContact,
      startDate,
      endDate
    } = req.body;

    // ✅ Step 1: Validate required fields
    const missingFields = [];
    if (!category) missingFields.push("category");
    if (!quantity) missingFields.push("quantity");
    if (!expectedDeliveryDate) missingFields.push("expectedDeliveryDate");
    if (!requestedAmount) missingFields.push("requestedAmount");
    if (!requesterDepartmentId) missingFields.push("requesterDepartmentId");

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: false,
        message: `Please add required fields: ${missingFields.join(", ")}`,
      });
    }

    // ✅ Step 2: Handle Category
    if (isNaN(category)) {
      const newCategory = await Category.create({ name: category });
      category = newCategory.id;
    }

    // ✅ Step 3: Handle Subcategory
    if (subcategory && isNaN(subcategory)) {
      const newSubcategory = await Subcategory.create({
        name: subcategory,
        categoryId: category,
      });
      subcategory = newSubcategory.id;
    }

    // ✅ Step 4: Handle supplier (find or create only if all details exist)
    let supplier = null;

    if (supplierEmail && supplierName) {
      supplier = await Supplier.findOne({ where: { contactEmail: supplierEmail } });

      if (!supplier) {
        supplier = await Supplier.create({
          name: supplierName,
          contactEmail: supplierEmail,
          contactPhone: supplierContact || "",
        });
      }
    }

    // ✅ Step 5: Handle uploaded files
    const contractDocumentFile = req.files?.contractDocument?.[0]?.path || null;
    const intakeAttachmentFile = req.files?.intakeAttachment?.[0]?.path || null;

    // ✅ Step 6: Create intake request
    const newIntakeRequest = await intakeRequest.create({
      requestType,
      categoryId: category,
      subcategory,
      engagementType,
      itemDescription,
      quantity,
      duration,
      expectedDeliveryDate,
      executionTimeline,
      reasonForEarlierExecution,
      serviceDuration,
      amendmentType,
      contractDocument: contractDocumentFile,
      intakeAttachement: intakeAttachmentFile,
      budgetCode,
      requestedAmount,
      requesterName,
      requesterDepartmentId,
      requesterEmail,
      requesterContactNumber,
      additionalDescription,
      authorizedSignatory,
      suppliersCountry,
      subcontractorInvolved,
      subcontractorInfo,
      vendor,
      contract,
      helpDescription,
      whatToBuy,
      addLicenseToExistingProduct,
      involvesCloud,
      shareCustomerOrEmployeeInfo,
      status,
      userId,
      supplierEmail: supplier?.contactEmail || null,
      supplierName: supplier?.name || null,
      supplierContact: supplier?.contactPhone || null,
      startDate,
      endDate
    });

    if (!newIntakeRequest) {
      return res.status(404).json({
        status: false,
        message: "Request not created",
        data: [],
      });
    }

    return res.status(201).json({
      status: true,
      message: "Request added successfully",
      newIntakeRequest,
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const get_all_intake_requests = async (req, res) => {
  try {
    // Check user role for data filtering
    const userType = req.user?.userType;
    const userId = req.user?.id;
    const isSuperAdmin = userType === 'superadmin';
    
    const page = req.query.page ? parseInt(req.query.page, 10) : null;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    const offset = page && limit ? (page - 1) * limit : 0;

    const { requestType, status } = req.query;

    const where = {};

    if (requestType) {
      where.requestType = requestType;
    }

    if (status) {
      where.status = status;
    }

    // Add userId filter for Admin users (SuperAdmin sees all)
    if (!isSuperAdmin && userId) {
      where.userId = userId;
    }

    // ✅ Fetch intake requests with pagination and descending order
    const { rows: intakeRequests, count: totalRecords } = await intakeRequest.findAndCountAll({
      where,
      include: [
        {
          model: department,
          as: 'department',
          attributes: ['id', 'name'],
        }
      ],
      ...(page && limit ? { limit, offset } : {}),  // Apply pagination only if page & limit exist
      order: [['createdAt', 'DESC']],  // ✅ Sort by 'createdAt' in descending order
    });

    if (intakeRequests.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No requests found',
        data: [],
      });
    }

    // Fetch the supplier information for the assigned requests
    const requestIds = intakeRequests.map(req => req.id);

    const assignedRequests = await assignIntakeRequest.findAll({
      where: { requestId: requestIds },
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['name'],
        },
      ],
      raw: true,
      nest: true,
    });

    // Map the supplier information to the requests
    const supplierMap = assignedRequests.reduce((acc, item) => {
      if (item.supplier) acc[item.requestId] = item.supplier;
      return acc;
    }, {});

    // Merge supplier information into the intake requests
    const updatedRequests = intakeRequests.map(request => {
      const updatedRequest = { ...request.toJSON() };  // Convert Sequelize instance to plain object
      if (supplierMap[request.id]) {
        updatedRequest.supplier = supplierMap[request.id];
      }
      return updatedRequest;
    });

    const pagination = page && limit
      ? {
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords,
        limit,
      }
      : null;

    return res.status(200).json({
      status: true,
      message: 'Requests fetched successfully',
      data: updatedRequests,
      ...(pagination && { pagination }),  // Include pagination only if it exists
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const get_all_not_pending_intake_requests = async (req, res) => {
  try {
    // Check user role for data filtering
    const userType = req.user?.userType;
    const userId = req.user?.id;
    const isSuperAdmin = userType === 'superadmin';
    
    const page = req.query.page ? parseInt(req.query.page, 10) : null;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    const offset = page && limit ? (page - 1) * limit : 0;

    const { requestType, status } = req.query;

    const where = {};

    if (requestType) {
      where.requestType = requestType;
    }

    // ✅ Always exclude 'pending' if status is not explicitly passed
    if (status) {
      where.status = status;
    } else {
      where.status = { [Op.ne]: 'pending' }; // Exclude 'pending' by default
    }

    // Add userId filter for Admin users (SuperAdmin sees all)
    if (!isSuperAdmin && userId) {
      where.userId = userId;
    }

    const { rows: intakeRequests, count: totalRecords } = await intakeRequest.findAndCountAll({
      where,
      include: [
        {
          model: department,
          as: 'department',
          attributes: ['id', 'name'],
        }
      ],
      ...(page && limit ? { limit, offset } : {}),
      order: [['createdAt', 'DESC']],
    });

    if (intakeRequests.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No requests found',
        data: [],
      });
    }

    const requestIds = intakeRequests.map(req => req.id);

    const assignedRequests = await assignIntakeRequest.findAll({
      where: { requestId: requestIds },
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['name'],
        },
      ],
      raw: true,
      nest: true,
    });

    const supplierMap = assignedRequests.reduce((acc, item) => {
      if (item.supplier) acc[item.requestId] = item.supplier;
      return acc;
    }, {});

    const updatedRequests = intakeRequests.map(request => {
      const updatedRequest = { ...request.toJSON() };
      if (supplierMap[request.id]) {
        updatedRequest.supplier = supplierMap[request.id];
      }
      return updatedRequest;
    });

    const pagination = page && limit
      ? {
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords,
        limit,
      }
      : null;

    return res.status(200).json({
      status: true,
      message: 'Requests fetched successfully',
      data: updatedRequests,
      ...(pagination && { pagination }),
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const get_intake_request_by_id = async (req, res) => {
  try {
    // Check user role for data filtering
    const userType = req.user?.userType;
    const userId = req.user?.id;
    const isSuperAdmin = userType === 'superadmin';
    
    const { id } = req.params;

    // Build where clause - Admin users can only see their own requests
    const whereClause = { id };
    if (!isSuperAdmin && userId) {
      whereClause.userId = userId;
    }

    const intake = await intakeRequest.findOne({
      where: whereClause,
      include: [
        {
          model: department,
          as: 'department',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!intake) {
      return res.status(404).json({
        status: false,
        message: 'Request not found',
      });
    }

    // Get supplier info if assigned
    const assignedRequest = await assignIntakeRequest.findOne({
      where: { requestId: id },
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['name'],
        },
      ],
    });

    const intakeData = intake.toJSON();
    if (assignedRequest?.supplier) {
      intakeData.supplier = assignedRequest.supplier;
    }

    return res.status(200).json({
      status: true,
      message: 'Request fetched successfully',
      data: intakeData,
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const updatestatus = async (req, res) => {
  const { id } = req.params;
  
  // Check user role for data filtering
  const userType = req.user?.userType;
  const userId = req.user?.id;
  const isSuperAdmin = userType === 'superadmin';
  
  // Build where clause - Admin users can only update their own requests
  const whereClause = { id };
  if (!isSuperAdmin && userId) {
    whereClause.userId = userId;
  }

  try {
    const request = await intakeRequest.findOne({ where: whereClause });

    if (!request) {
      return res.status(404).json({
        status: false,
        message: "Request not found",
      });
    }

    // 🔁 Toggle status
    const newStatus = request.status === "active" ? "pending" : "active";
    request.status = newStatus;

    await request.save(); // ✅ Save updated record

    return res.status(200).json({
      status: true,
      message: `Request status updated to ${newStatus}`,
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};


const update_intake_request = async (req, res) => {
  const userId = req.user.id;
  const userType = req.user.userType;
  const isSuperAdmin = userType === 'superadmin';

  try {
    const { id } = req.params;
    const { status } = req.body;

    // Build where clause - Admin users can only update their own requests
    const whereClause = { id };
    if (!isSuperAdmin && userId) {
      whereClause.userId = userId;
    }

    // Find intake request
    const Request = await intakeRequest.findOne({ where: whereClause });
    if (!Request) {
      return res.status(404).json({
        status: false,
        message: "Request not found",
      });
    }

    // Check if status is provided and different
    if (status && Request.status !== status) {
      let existsApprover;

      // Determine which table to use for storing the approver data
      if (userType === 'user') {
        // Check for existing approver in procurement_request_approvers table if userType is 'user'
        existsApprover = await procurement_request_approvers.findOne({ where: { userId, intakeRequestId: id } });

        if (existsApprover) {
          // Update status in procurement_request_approvers if exists
          await procurement_request_approvers.update({ status }, { where: { intakeRequestId: id, userId } });
        } else {
          // Create new approver in procurement_request_approvers if not exists
          await procurement_request_approvers.create({
            intakeRequestId: id,
            userId,
            status,
            userType
          });
        }
      } else {
        // Check for existing approver in intake_request_approvers table for other userTypes
        existsApprover = await intake_request_approvers.findOne({ where: { userId, intakeRequestId: id } });

        if (existsApprover) {
          // Update status in intake_request_approvers if exists
          await intake_request_approvers.update({ status }, { where: { intakeRequestId: id, userId } });
        } else {
          // Create new approver in intake_request_approvers if not exists
          await intake_request_approvers.create({
            intakeRequestId: id,
            userId,
            status,
            userType
          });
        }
      }
    }

    // Update the intake request (with userId filter for Admin users)
    const updatedRequest = await intakeRequest.update(req.body, { where: whereClause });

    if (updatedRequest[0] === 0) {
      return res.status(400).json({
        status: false,
        message: "Failed to update request",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Request updated successfully",
    });
  } catch (error) {
    console.error("Error updating request:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const delete_intake_request = async (req, res) => {
  try {
    // Check user role for data filtering
    const userType = req.user?.userType;
    const userId = req.user?.id;
    const isSuperAdmin = userType === 'superadmin';
    
    const { id } = req.params;

    // Build where clause - Admin users can only delete their own requests
    const whereClause = { id };
    if (!isSuperAdmin && userId) {
      whereClause.userId = userId;
    }

    const deletedRequest = await intakeRequest.destroy({ where: whereClause });

    if (deletedRequest === 0) {
      return res.status(404).json({
        status: false,
        message: "Intake request not found"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Intake request deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

// const intake_dashboard = async (req, res) => {
//     try {

//         // Pagination parameters from query
//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 7;
//         const offset = (page - 1) * limit;

//         // Count total requests
//         const totalRequests = await intakeRequest.count();

//         // Count pending approvals
//         const pendingApprovals = await intakeRequest.count({ where: { status: "pending" } });

//         // Count approved requests
//         const approvedRequests = await intakeRequest.count({ where: { status: "approved" } });

//         // Fetch all requests with pagination
//         const allRequests = await intakeRequest.findAll({
//             offset,
//             limit,
//             order: [['createdAt', 'DESC']],
//         });

//         // Calculate total pages for pagination
//         const totalPages = Math.ceil(totalRequests / limit);


//         return res.status(200).json({
//             status: true,
//             message: "Dashboard data fetched successfully",
//             data: {
//                 totalRequests,
//                 pendingApprovals,
//                 approvedRequests,
//                 allRequests,
//                 pagination: {
//                     currentPage: page,
//                     totalPages,
//                     totalRecords: totalRequests,
//                     limit,
//                 },
//             },
//         });
//     } catch (error) {
//         console.error(error.stack); // Log the error for debugging
//         return res.status(500).json({
//             status: false,
//             message: "An unexpected error occurred while fetching the dashboard data.",
//             error: error.message,
//         });
//     }
// };

const intake_dashboard = async (req, res) => {
  try {
    // Check user role for data filtering
    const userType = req.user?.userType;
    const userId = req.user?.id;
    const isSuperAdmin = userType === 'superadmin';
    
    // Build where clause for Admin users (filter by userId)
    const adminWhereClause = isSuperAdmin ? {} : { userId: userId };
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 7;
    const offset = (page - 1) * limit;

    const totalRequests = await intakeRequest.count({ where: adminWhereClause });
    const pendingApprovals = await intakeRequest.count({ 
      where: { 
        status: "pending",
        ...adminWhereClause
      } 
    });
    const approvedRequests = await intakeRequest.count({ 
      where: { 
        status: "approved",
        ...adminWhereClause
      } 
    });

    const allRequests = await intakeRequest.findAll({
      where: adminWhereClause,
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      raw: true,
      include: [
        {
          model: department,
          as: 'department',
          attributes: ['id', 'name'],
        }
      ],
    });

    const requestIds = allRequests.map(req => req.id);

    const assignedRequests = await assignIntakeRequest.findAll({
      where: { requestId: requestIds },
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['name'],
        }
      ],
      raw: true,
      nest: true,
    });

    const supplierMap = assignedRequests.reduce((acc, item) => {
      if (item.supplier) acc[item.requestId] = item.supplier;
      return acc;
    }, {});

    const updatedRequests = allRequests.map(request => {
      if (supplierMap[request.id]) {
        return {
          ...request,
          supplier: supplierMap[request.id],
        };
      }
      return request;
    });

    const totalPages = Math.ceil(totalRequests / limit);

    return res.status(200).json({
      status: true,
      message: "Dashboard data fetched successfully",
      data: {
        totalRequests,
        pendingApprovals,
        approvedRequests,
        allRequests: updatedRequests,
        pagination: {
          currentPage: page,
          totalPages,
          totalRecords: totalRequests,
          limit,
        },
      },
    });
  } catch (error) {
    console.error(error.stack);
    return res.status(500).json({
      status: false,
      message: "An unexpected error occurred while fetching the dashboard data.",
      error: error.message,
    });
  }
};


const add_comment = async (req, res) => {
  const userId = req.user.id;
  try {
    const { comment, selectedRequestId ,userType} = req.body;

    // Validate required fields
    if (!selectedRequestId || !userId || !comment) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create new comment
    const newComment = await intake_request_comment.create({
      requestId: selectedRequestId,
      userId,
      commentMessage: comment,
      userType
    });

    return res.status(201).json({
      status: true,
      message: "Comment added successfully.",
      data: newComment,
    });

  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
const update_request = async (req, res) => {
  try {
    // Check user role for data filtering
    const userType = req.user?.userType;
    const userId = req.user?.id;
    const isSuperAdmin = userType === 'superadmin';
    
    const { id } = req.params;

    // Build where clause - Admin users can only update their own requests
    const whereClause = { id };
    if (!isSuperAdmin && userId) {
      whereClause.userId = userId;
    }

    // Find the existing request
    const existingRequest = await intakeRequest.findOne({ where: whereClause });

    if (!existingRequest) {
      return res.status(404).json({
        status: false,
        message: 'Request not found',
      });
    }

    // Build update payload
    const updateData = { ...req.body };

    // Handle file uploads if any (e.g. req.file or req.files if using multer)
    if (req.files && req.files.contractDocument) {
      updateData.contractDocument = req.files.contractDocument[0].filename;
    }
    if (req.files && req.files.reqAttachMentfile) {
      updateData.reqAttachMentfile = req.files.reqAttachMentfile[0].filename;
    }
    if (req.files && req.files.intakeAttachment) {
      updateData.intakeAttachment = req.files.intakeAttachment[0].filename;
    }

    // Update the request
    await existingRequest.update(updateData);

    return res.status(200).json({
      status: true,
      message: 'Request updated successfully',
      data: existingRequest,
    });

  } catch (error) {
    console.error('Update Error:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Something went wrong',
    });
  }
};

const get_intake_request_details = async (req, res) => {
  // Check user role for data filtering
  const userType = req.user?.userType;
  const userId = req.user?.id;
  const isSuperAdmin = userType === 'superadmin';
  
  const { intakeRequestId } = req.query;

  try {
    // Build where clause - Admin users can only see their own requests
    const whereClause = { id: intakeRequestId };
    if (!isSuperAdmin && userId) {
      whereClause.userId = userId;
    }

    // Step 1: Get Intake Request (filtered for Admin users)
    const intakeRequestData = await intakeRequest.findOne({ where: whereClause });
    if (!intakeRequestData) {
      return res.status(404).json({
        status: false,
        message: "Intake request not found",
      });
    }

    // Step 2: Get Comments
    const comments = await intake_request_comment.findAll({
      where: {requestId: intakeRequestId },
      order: [['createdAt', 'ASC']],
    });

    // Step 3: Get Approver Status from intake_request_approvers
    // const approvers = await intake_request_approvers.findAll({
    //   where: { intakeRequestId },
    //   include: [
    //     {
    //       model: User, // Assuming approver is a user
    //       as: 'userDetails',
    //       attributes: ['id', 'name', 'email']
    //     }
    //   ],
    //   order: [['createdAt', 'ASC']],
    // });

    // Step 4: Return the aggregated dat  a
    return res.status(200).json({
      status: true,
      message: "Fetched intake request comments and approvers successfully",
      data: { 
        intakeRequest: intakeRequestData,
        comments,
        // approvers
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  add_intake_request,
  get_all_intake_requests,
  update_intake_request,
  delete_intake_request,
  intake_dashboard,
  add_comment,
  updatestatus,
  get_intake_request_by_id,
  update_request,
  get_all_not_pending_intake_requests,
  get_intake_request_details
};
