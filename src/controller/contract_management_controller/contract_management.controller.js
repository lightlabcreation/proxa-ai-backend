const db = require("../../../config/config");
const Contract = db.contract;
const Department = db.department
const Supplier = db.supplier;
const contract_template = db.contract_template ; 
const { Op } = require('sequelize');
const moment = require('moment');

const get_contracts_dashboard = async (req, res) => {
    try {
      // Check user role for data filtering
      const userType = req.user?.userType;
      const userId = req.user?.id;
      const isSuperAdmin = userType === 'superadmin';
      
      // Build where clause for Admin users (filter by userId)
      const adminWhereClause = isSuperAdmin ? {} : { userId: userId };
      
      // Pagination parameters
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;
  
      const searchTerm = req.query.searchTerm || '';  // Default to empty if no searchTerm provided
  
      // Build the search condition
      const searchCondition = {
        [Op.or]: [
          { contractTypeId: { [Op.like]: `%${searchTerm}%` } },
          { '$department.name$': { [Op.like]: `%${searchTerm}%` } },
          { '$supplier.name$': { [Op.like]: `%${searchTerm}%` } },
        ],
        ...adminWhereClause  // Add userId filter for Admin users
      };
  
      // Fetch contracts with pagination and the applied search term
      const { rows: contracts, count: totalRecords } = await Contract.findAndCountAll({
        limit,
        offset,
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'name'],
          },
          {
            model: Supplier,
            as: 'supplier',
            attributes: ['id', 'name'],
          },
          {
            model: contract_template,
            as: 'contractType',
            attributes: ['id', 'aggrementName' , 'customAgreementFile'],
          },

        ],
        where: searchCondition,  // Apply the search condition here
      });
  
      // Check if no contracts are found
      if (contracts.length === 0) {
        return res.status(404).json({
          status: false,
          message: 'No contracts found',
          data: [],
        });
      }
  
      // Calculate the number of contracts expiring soon (within 30 days) - filtered for Admin users
      const expiringSoonCount = await Contract.count({
        where: {
          endDate: {
            [Op.lt]: moment().add(30, 'days').toDate(),
          },
          ...adminWhereClause
        },
      });
  
      // Calculate the total number of contracts
      const totalContractsCount = totalRecords;
  
      // Pagination info
      const totalPages = Math.ceil(totalRecords / limit);
  
      return res.status(200).json({
        status: true,
        message: 'Contracts fetched successfully',
        data: {
          contracts,
          totalContractsCount,
          expiringSoonCount,
        },
        pagination: {
          currentPage: page,
          totalPages,
          totalRecords,
          limit,
        },
      });
    } catch (error) {
      console.error('Error fetching contracts dashboard:', error);  // Log error for debugging
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  };
  
const add_contract = async (req, res) => {
    const userId = req.user.id ;
    try {
        const {
            contractName,
            description,
            contractTypeId,
            departmentId,
            startDate,
            endDate,
            sourceLeadName,
            sourceDirectorName,
            buisnessStackHolder,
            supplierName,
            budget,
            currency,
            paymentTerms,
            milestones,
            approvers,
            approvalLevels,
            thresholdRules,
            agreementId
        } = req.body;

        // Handle file upload
        const contractAttachmentFile = req.file ? req.file.path : null;

        // Create a new contract
        const newContract = await Contract.create({
            contractName,
            description,
            contractTypeId,
            departmentId,
            startDate,
            endDate,
            sourceLeadName,
            sourceDirectorName,
            buisnessStackHolder,
            supplierId:supplierName,
            budget,
            currency,
            paymentTerms,
            milestones,
            contractAttachmentFile,
            approvers,
            approvalLevels,
            thresholdRules,
            agreementId,
            userId,
        });

        return res.status(201).json({
            status: true,
            message: "Contract added successfully",
            data: newContract,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

const get_all_contracts = async (req, res) => {
    try {
      // Check user role for data filtering
      const userType = req.user?.userType;
      const userId = req.user?.id;
      const isSuperAdmin = userType === 'superadmin';
      
      // Build where clause for Admin users (filter by userId)
      const adminWhereClause = isSuperAdmin ? {} : { userId: userId };
      
      const page = parseInt(req.query.page, 10) || 1; 
      const limit = parseInt(req.query.limit, 10) || 10; 
      const offset = (page - 1) * limit;
  
      const searchTerm = req.query.searchTerm || '';  // Default to empty if no searchTerm provided
  
      // Build the search condition
      const searchCondition = {
        [Op.or]: [
          { contractTypeId: { [Op.like]: `%${searchTerm}%` } },
          { '$department.name$': { [Op.like]: `%${searchTerm}%` } },
          { '$supplier.name$': { [Op.like]: `%${searchTerm}%` } },
        ],
        ...adminWhereClause  // Add userId filter for Admin users
      };
  
      // Log searchTerm and constructed query to debug if needed
      console.log('Search Term:', searchTerm);
      console.log('Search Condition:', searchCondition);
  
      // Fetch contracts with pagination, search condition, and associated Department and Supplier
      const { rows: contracts, count: totalRecords } = await Contract.findAndCountAll({
        limit,
        offset,
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'name'],
            where: {
              name: { [Op.like]: `%${searchTerm}%` },
            },
          },
          {
            model: Supplier,
            as: 'supplier',
            attributes: ['id', 'name'],
            where: {
              name: { [Op.like]: `%${searchTerm}%` },
            },
          },
          {
            model: contract_template,
            as: 'contractType',
            attributes: ['id', 'aggrementName' , 'customAgreementFile'],
          },
        ],
        where: searchCondition,  // Apply the search condition here
        logging: console.log,  // Optional: Logs the SQL query being executed
      });
  
      if (contracts.length === 0) {
        return res.status(404).json({
          status: false,
          message: 'No contracts found',
          data: [],
        });
      }
  
      const totalPages = Math.ceil(totalRecords / limit);
  
      return res.status(200).json({
        status: true,
        message: 'Contracts fetched successfully',
        data: contracts,
        pagination: {
          currentPage: page,
          totalPages,
          totalRecords,
          limit,
        },
      });
    } catch (error) {
      console.error('Error fetching contracts:', error);  // Log the error for debugging
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  };
  const update_contract = async (req, res) => {
    try {
      // Check user role for data filtering
      const userType = req.user?.userType;
      const userId = req.user?.id;
      const isSuperAdmin = userType === 'superadmin';
      
      const { id } = req.params;
  
      // Build where clause - Admin users can only update their own contracts
      const whereClause = { id };
      if (!isSuperAdmin && userId) {
        whereClause.userId = userId;
      }
  
      // Find the contract by ID
      const contract = await Contract.findOne({ where: whereClause });
  
      if (!contract) {
        return res.status(404).json({
          status: false,
          message: "Contract not found",
        });
      }
  
      // Update the contract with the provided data
      await contract.update(req.body);  // Update the specific contract instance
  
      // Return the updated contract data in the response
      res.status(200).json({
        status: true,
        message: "Contract updated successfully!",
        data: contract,  // Return the updated contract
      });
    } catch (error) {
      console.error("Error updating contract:", error);
      res.status(500).json({
        status: false,
        message: "Failed to update contract",
        error: error.message,
      });
    }
  };
  const delete_contract = async (req, res) => {
    try {
        // Check user role for data filtering
        const userType = req.user?.userType;
        const userId = req.user?.id;
        const isSuperAdmin = userType === 'superadmin';
        
        const { id } = req.params;

        // Build where clause - Admin users can only delete their own contracts
        const whereClause = { id };
        if (!isSuperAdmin && userId) {
          whereClause.userId = userId;
        }

        const deletedContract = await Contract.destroy({
            where: whereClause,
        });

        if (deletedContract === 0) {
            return res.status(404).json({
                status: false,
                message: "Contract not found",
            });
        }

        return res.status(200).json({
            status: true,
            message: "Contract deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

module.exports = {
    get_contracts_dashboard,
    add_contract,
    get_all_contracts,
    update_contract,
    delete_contract,
};
