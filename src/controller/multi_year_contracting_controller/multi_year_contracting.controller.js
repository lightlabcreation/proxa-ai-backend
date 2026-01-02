const db = require('../../../config/config');
const MultiYearContracting = db.multi_year_contracting;
const Supplier = db.supplier;
// Add a new multi-year contract
const add_multi_year_contract = async (req, res) => {
    const { id: userId, userType } = req.user;

    // 🔐 ROLE GUARD - Only admin and superadmin can access
    if (!['admin', 'superadmin'].includes(userType)) {
        return res.status(401).json({
            status: false,
            message: 'Unauthorized',
        });
    }

    try {
        const { supplierId, currentContractDuration, multiYearProposal, savingsEstimate, status } = req.body;

        // Check if required fields are empty
        const requiredFields = ['supplierId', 'currentContractDuration', 'multiYearProposal'];
        const isEmptyKey = requiredFields.some(field => {
            const value = req.body[field];
            return value === null || value === undefined;
        });

        if (isEmptyKey) {
            return res.status(400).json({
                status: false,
                message: 'Please fill in all required fields',
            });
        }

        // Create the new multi-year contract record
        const newContract = await MultiYearContracting.create({
            supplierId,
            currentContractDuration,
            multiYearProposal,
            savingsEstimate,
            status: status || 'Pending',
            userId
        });

        if (!newContract) {
            return res.status(404).json({
                status: false,
                message: 'Multi-year contract not created',
            });
        }

        return res.status(201).json({
            status: true,
            message: 'Multi-year contract added successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Get all multi-year contracts
const get_all_multi_year_contracts = async (req, res) => {
    try {
        // Check user role for data filtering
        const { id: userId, userType } = req.user;

        // 🔐 ROLE GUARD - Only admin and superadmin can access
        if (!['admin', 'superadmin'].includes(userType)) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
            });
        }

        const isSuperAdmin = userType === 'superadmin';
        
        // Build where clause for Admin users (filter by userId)
        const adminWhereClause = isSuperAdmin ? {} : { userId: userId };
        
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 7;
        const offset = (page - 1) * limit;

        // Fetch multi-year contracts with supplier details (filtered for Admin users)
        const { rows: contracts, count: totalRecords } = await MultiYearContracting.findAndCountAll({
            where: adminWhereClause,
            limit,
            offset,
            include: [
                {
                    model: Supplier,
                    as: "supplier",
                    attributes: ["name"],
                },
            ],
        });

        // Count contracts with status "Under Review" (filtered for Admin users)
        const underReviewCount = await MultiYearContracting.count({
            where: { 
                status: "Under Review",
                ...adminWhereClause
            },
        });

        // Get total contract count (filtered for Admin users)
        const totalContractCount = await MultiYearContracting.count({
            where: adminWhereClause
        });

        if (contracts.length === 0) {
            return res.status(200).json({
                status: true,
                message: "No multi-year contracts found",
                data: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalRecords: 0,
                    limit,
                },
                contractStats: {
                    underReviewCount: 0,
                    totalContractCount: 0,
                },
            });
        }

        const totalPages = Math.ceil(totalRecords / limit);

        return res.status(200).json({
            status: true,
            message: "Multi-year contracts fetched successfully",
            data: contracts,
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords,
                limit,
            },
            contractStats: {
                underReviewCount,
                totalContractCount,
            },
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};
const get_multi_year_contract_by_id = async (req, res) => {
    try {
        // Check user role for data filtering
        const { id: userId, userType } = req.user;

        // 🔐 ROLE GUARD - Only admin and superadmin can access
        if (!['admin', 'superadmin'].includes(userType)) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
            });
        }

        const isSuperAdmin = userType === 'superadmin';
        
        const { id } = req.params; // Get the contract ID from the request params

        // Build where clause - Admin users can only see their own contracts
        const whereClause = { id };
        if (!isSuperAdmin && userId) {
            whereClause.userId = userId;
        }

        // Fetch the single contract by ID with supplier details
        const contract = await MultiYearContracting.findOne({
            where: whereClause,
            include: [
                {
                    model: Supplier,
                    as: "supplier",
                    attributes: ["name"],
                },
            ],
        });

        if (!contract) {
            return res.status(404).json({
                status: false,
                message: "Multi-year contract not found",
                data: null,
            });
        }

        return res.status(200).json({
            status: true,
            message: "Multi-year contract fetched successfully",
            data: contract,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Update a multi-year contract
const update_multi_year_contract = async (req, res) => {
    try {
        // Check user role for data filtering
        const { id: userId, userType } = req.user;

        // 🔐 ROLE GUARD - Only admin and superadmin can access
        if (!['admin', 'superadmin'].includes(userType)) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
            });
        }

        const isSuperAdmin = userType === 'superadmin';
        
        const { id } = req.params;

        // Build where clause - Admin users can only update their own contracts
        const whereClause = { id };
        if (!isSuperAdmin && userId) {
          whereClause.userId = userId;
        }
        
        const updatedContract = await MultiYearContracting.update(req.body, { where: whereClause });

        if (updatedContract[0] === 0) {
            return res.status(404).json({
                status: false,
                message: 'Multi-year contract not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Multi-year contract updated successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Delete a multi-year contract
const delete_multi_year_contract = async (req, res) => {
    try {
        // Check user role for data filtering
        const { id: userId, userType } = req.user;

        // 🔐 ROLE GUARD - Only admin and superadmin can access
        if (!['admin', 'superadmin'].includes(userType)) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
            });
        }

        const isSuperAdmin = userType === 'superadmin';
        
        const { id } = req.params;

        // Build where clause - Admin users can only delete their own contracts
        const whereClause = { id };
        if (!isSuperAdmin && userId) {
          whereClause.userId = userId;
        }

        const deletedContract = await MultiYearContracting.destroy({ where: whereClause });

        if (deletedContract === 0) {
            return res.status(404).json({
                status: false,
                message: 'Multi-year contract not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Multi-year contract deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

module.exports = {
    add_multi_year_contract,
    get_all_multi_year_contracts,
    update_multi_year_contract,
    delete_multi_year_contract,
    get_multi_year_contract_by_id,
};
