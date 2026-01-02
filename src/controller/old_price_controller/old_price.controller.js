const db = require('../../../config/config');
const OldPricing = db.old_pricing;
const supplier  = db.supplier;
const subcategories = db.subcategories;
// Add a new old pricing record
const add_old_pricing = async (req, res) => {
    try {
        const { supplierId, categoryId, subcategoryId, oldPrice, currentQuotation, savingFromOldPricing, status ,productPurchased } = req.body;
        const { id: userId, userType } = req.user;

        // 🔐 ROLE GUARD - Only admin and superadmin can access
        if (!['admin', 'superadmin'].includes(userType)) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
            });
        }

        // Check if required fields are empty
        const requiredFields = ['supplierId', 'categoryId', 'oldPrice', 'currentQuotation', 'subcategoryId'];
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

        // Calculate saving from old pricing if not provided
        const saving = savingFromOldPricing || (oldPrice - currentQuotation);

        // Create the new old pricing record
        const newOldPricing = await OldPricing.create({
            supplierId,
            categoryId,
            subcategoryId, 
            oldPrice,
            currentQuotation,
            productPurchased,
            savingFromOldPricing: saving,
            status: status || 'Pending',  // Default to 'Pending' if status is not provided
            userId,
        });

        return res.status(201).json({
            status: true,
            message: 'Old pricing added successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Get all old pricing records
const get_all_old_pricing = async (req, res) => {
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

        const { rows: oldPricing, count: totalRecords } = await OldPricing.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            include: [
                {
                    model: supplier,
                    as: "supplier",
                    attributes: ["id", "name"], 
                },
                {
                    model: subcategories,
                    as: "subcategory",
                    attributes: ["id", "name"], 
                },
            ],
        });

        if (oldPricing.length === 0) {
            return res.status(200).json({
                status: true,
                message: 'No old pricing records found',
                data: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalRecords: 0,
                    limit,
                },
            });
        }

        const totalPages = Math.ceil(totalRecords / limit);

        return res.status(200).json({
            status: true,
            message: 'Old pricing records fetched successfully',
            data: oldPricing,
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords,
                limit,
            },
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};
const get_old_pricing_by_id = async (req, res) => {
    try {
        const { id } = req.params; // Get ID from URL params
        const { id: userId, userType } = req.user;

        // 🔐 ROLE GUARD - Only admin and superadmin can access
        if (!['admin', 'superadmin'].includes(userType)) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
            });
        }

        if (!id) {
            return res.status(400).json({
                status: false,
                message: "ID is required",
            });
        }

        // 🔐 ADMIN ISOLATION - Build where clause based on user type
        const whereClause = { id };
        if (userType === 'admin') {
            whereClause.userId = userId;
        }

        const oldPricing = await OldPricing.findOne({
            where: whereClause,
            include: [
                {
                    model: supplier,
                    as: "supplier",
                    attributes: ["id", "name"], 
                },
                {
                    model: subcategories,
                    as: "subcategory",
                    attributes: ["id", "name"], 
                },
            ],
        });

        if (!oldPricing) {
            return res.status(404).json({
                status: false,
                message: "Old pricing record not found",
            });
        }

        return res.status(200).json({
            status: true,
            message: "Old pricing record fetched successfully",
            data: oldPricing,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Update an old pricing record
const update_old_pricing = async (req, res) => {
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

        const updatedPricing = await OldPricing.update(req.body, { where: whereClause });

        if (updatedPricing[0] === 0) {
            return res.status(404).json({
                status: false,
                message: 'Old pricing record not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Old pricing record updated successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Delete an old pricing record
const delete_old_pricing = async (req, res) => {
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

        const deletedPricing = await OldPricing.destroy({ where: whereClause });

        if (deletedPricing === 0) {
            return res.status(404).json({
                status: false,
                message: 'Old pricing record not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Old pricing record deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

module.exports = {
    add_old_pricing,
    get_all_old_pricing,
    update_old_pricing,
    delete_old_pricing,
    get_old_pricing_by_id
};
