const db = require('../../../config/config'); 
const service_sow_consolidation = db.service_sow_consolidation;
const Supplier = db.supplier;
const Department = db.department;
// Add a new service SOW consolidation
const add_service_sow_consolidation = async (req, res) => {
    try {
        const { requestedTeamDepartmentId, requestedServiceTool, existingSupplierServiceId, consolidationSavings, status } = req.body;
        const { id: userId, userType } = req.user;

        // 🔐 ROLE GUARD - Only admin and superadmin can access
        if (!['admin', 'superadmin'].includes(userType)) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
            });
        }

        const requiredFields = ['requestedTeamDepartmentId', 'requestedServiceTool'];
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

        // Create the new service SOW consolidation
        const newServiceSOWConsolidation = await service_sow_consolidation.create({
            requestedTeamDepartmentId,
            requestedServiceTool,
            existingSupplierServiceId,
            consolidationSavings,
            status: status || 'Pending',
            userId,
        });

        if (!newServiceSOWConsolidation) {
            return res.status(404).json({
                status: false,
                message: 'Service SOW consolidation not created',
            });
        }

        return res.status(201).json({
            status: true,
            message: 'Service SOW consolidation added successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Get all service SOW consolidations
const get_all_service_sow_consolidations = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 7;
        const offset = (page - 1) * limit;

        const { id: userId, userType } = req.user;

        // 🔐 ROLE GUARD - Only admin and superadmin can access
        if (!['admin', 'superadmin'].includes(userType)) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
            });
        }

        // 🔐 ADMIN ISOLATION - Build where clause based on user type
        const whereClause = {};
        if (userType === 'admin') {
            whereClause.userId = userId;
        }

        const { rows: serviceSOWConsolidations, count: totalRecords } = await service_sow_consolidation.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            include: [
                {
                    model: Supplier,
                    as:"supplierDetails",
                    attributes: ['name', 'id']
                },
                {
                    model: Department,
                    as:"department",
                    attributes: ['name', 'id']
                }
            ],
        });

        if (serviceSOWConsolidations.length === 0) {
            return res.status(200).json({
                status: true,
                message: 'No service SOW consolidations found',
                data: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalRecords: 0,
                    limit,
                },
                totalServiceCount: 0,
                uniqueServiceCount: 0,
            });
        }

        const totalServiceCount = totalRecords;

        const uniqueServices = await service_sow_consolidation.findAll({
            where: whereClause,
            attributes: ['requestedServiceTool'],
            group: ['requestedServiceTool'],
            distinct: true,
        });

        const uniqueServiceCount = uniqueServices.length;

        const totalPages = Math.ceil(totalRecords / limit);

        return res.status(200).json({
            status: true,
            message: 'Service SOW consolidations fetched successfully',
            data: serviceSOWConsolidations,
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords,
                limit,
            },
            totalServiceCount,
            uniqueServiceCount,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};
const get_service_sow_consolidation_by_id = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, userType } = req.user;

        // 🔐 ROLE GUARD - Only admin and superadmin can access
        if (!['admin', 'superadmin'].includes(userType)) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
            });
        }

        // 🔐 ADMIN ISOLATION - Build where clause based on user type
        const whereClause = { id };
        if (userType === 'admin') {
            whereClause.userId = userId;
        }

        const serviceSOWConsolidation = await service_sow_consolidation.findOne({
            where: whereClause,
            include: [
                {
                    model: Supplier,
                    as: "supplierDetails",
                    attributes: ['name', 'id']
                },
                {
                    model: Department,
                    as: "department",
                    attributes: ['name', 'id']
                }
            ],
        });

        if (!serviceSOWConsolidation) {
            return res.status(404).json({
                status: false,
                message: 'Service SOW consolidation not found',
                data: null,
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Service SOW consolidation fetched successfully',
            data: serviceSOWConsolidation,
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Update a service SOW consolidation
const update_service_sow_consolidation = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, userType } = req.user;

        // 🔐 ROLE GUARD - Only admin and superadmin can access
        if (!['admin', 'superadmin'].includes(userType)) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
            });
        }

        // 🔐 ADMIN ISOLATION - Build where clause based on user type
        const whereClause = { id };
        if (userType === 'admin') {
            whereClause.userId = userId;
        }

        const updatedServiceSOWConsolidation = await service_sow_consolidation.update(req.body, { where: whereClause });

        if (updatedServiceSOWConsolidation[0] === 0) {
            return res.status(404).json({
                status: false,
                message: 'Service SOW consolidation not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Service SOW consolidation updated successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Delete a service SOW consolidation
const delete_service_sow_consolidation = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, userType } = req.user;

        // 🔐 ROLE GUARD - Only admin and superadmin can access
        if (!['admin', 'superadmin'].includes(userType)) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
            });
        }

        // 🔐 ADMIN ISOLATION - Build where clause based on user type
        const whereClause = { id };
        if (userType === 'admin') {
            whereClause.userId = userId;
        }

        const deletedServiceSOWConsolidation = await service_sow_consolidation.destroy({ where: whereClause });

        if (deletedServiceSOWConsolidation === 0) {
            return res.status(404).json({
                status: false,
                message: 'Service SOW consolidation not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Service SOW consolidation deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

module.exports = {
    add_service_sow_consolidation,
    get_all_service_sow_consolidations,
    get_service_sow_consolidation_by_id,
    update_service_sow_consolidation,
    delete_service_sow_consolidation,
};
