const db = require('../../../config/config');
const ComplementaryService = db.complementary_service;
const Supplier = db.supplier;
const Category = db.category;
// Add a new complementary service
const add_complementary_service = async (req, res) => {
    const { id: userId, userType } = req.user;

    // 🔐 ROLE GUARD - Only admin and superadmin can access
    if (!['admin', 'superadmin'].includes(userType)) {
        return res.status(401).json({
            status: false,
            message: 'Unauthorized',
        });
    }

    try {
        const { supplierId, categoryId, complementaryService, cost, saving, status ,productPurchased} = req.body;

        // Check if required fields are empty
        const requiredFields = ['supplierId', 'categoryId', 'complementaryService', 'cost'];
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

        // Create the new complementary service
        const newComplementaryService = await ComplementaryService.create({
            supplierId,
            categoryId,
            productPurchased,
            complementaryService,
            cost,
            saving,
            status: status || 'proposed', // Default status is Active
            userId
        });

        if (!newComplementaryService) {
            return res.status(404).json({
                status: false,
                message: 'Complementary service not created',
            });
        }

        return res.status(201).json({
            status: true,
            message: 'Complementary service added successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Get all complementary services
const get_all_complementary_services = async (req, res) => {
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

        const { rows: complementaryServices, count: totalRecords } = await ComplementaryService.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            include: [
                {
                    model: Supplier, 
                    as:"supplier",
                    attributes: ['id', 'name'], // Adjust according to your supplier model
                },
                {
                    model: Category,
                    as:"category",
                    attributes: ['id', 'name'], // Adjust according to your category model
                },
            ],
        });

        if (complementaryServices.length === 0) {
            return res.status(200).json({
                status: true,
                message: 'No complementary services found',
                data: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalRecords: 0,
                    limit,
                },
                additionalInfo: {
                    numberOfBundlesCreated: 0,
                    topServiceName: null,
                    topServiceCount: 0,
                },
            });
        }

        const numberOfBundlesCreated = totalRecords;

        const serviceCount = complementaryServices.reduce((acc, service) => {
            const serviceName = service.complementaryService;
            if (!acc[serviceName]) {
                acc[serviceName] = 1;
            } else {
                acc[serviceName] += 1;
            }
            return acc;
        }, {});

        let topServiceName = null;
        let topServiceCount = 0;

        for (const [serviceName, count] of Object.entries(serviceCount)) {
            if (count > topServiceCount) {
                topServiceName = serviceName;
                topServiceCount = count;
            }
        }

        const totalPages = Math.ceil(totalRecords / limit);

        return res.status(200).json({
            status: true,
            message: 'Complementary services fetched successfully',
            data: complementaryServices.map(service => ({
                ...service.dataValues,
                supplierName: service.Supplier?.name, // Adjust based on your model
                categoryName: service.Category?.name, // Adjust based on your model
            })),
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords,
                limit,
            },
            additionalInfo: {
                numberOfBundlesCreated,
                topServiceName,
                topServiceCount,
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Update a complementary service
const update_complementary_service = async (req, res) => {
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

        const updatedComplementaryService = await ComplementaryService.update(req.body, { where: whereClause });

        if (updatedComplementaryService[0] === 0) {
            return res.status(404).json({
                status: false,
                message: 'Complementary service not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Complementary service updated successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Delete a complementary service
const delete_complementary_service = async (req, res) => {
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

        const deletedComplementaryService = await ComplementaryService.destroy({ where: whereClause });

        if (deletedComplementaryService === 0) {
            return res.status(404).json({
                status: false,
                message: 'Complementary service not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Complementary service deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};
const get_complementary_service_by_id = async (req, res) => {
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

        const complementaryService = await ComplementaryService.findOne({
            where: whereClause,
        });

        if (!complementaryService) {
            return res.status(404).json({
                status: false,
                message: "Complementary service not found",
            });
        }

        return res.status(200).json({
            status: true,
            message: "Complementary service fetched successfully",
            data: {
                ...complementaryService.dataValues,
            },
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

module.exports = {
    add_complementary_service,
    get_all_complementary_services,
    update_complementary_service,
    delete_complementary_service,
    get_complementary_service_by_id,
};
