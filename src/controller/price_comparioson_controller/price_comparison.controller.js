const db = require('../../../config/config');
const PriceComparison = db.price_comparison;
const Supplier = db.supplier;
// Add a new price comparison
// const add_price_comparison = async (req, res) => {
//     try {
//         const { supplierName, product, priceQuoted, deliveryTerms, additionalBenefits, recommendedSupplier } = req.body;

//         // Check if required fields are empty
//         const requiredFields = ['supplierName', 'product', 'priceQuoted'];
//         const isEmptyKey = requiredFields.some(field => {
//             const value = req.body[field];
//             return value === null || value === undefined;
//         });

//         if (isEmptyKey) {
//             return res.status(400).json({
//                 status: false,
//                 message: 'Please fill in all required fields',
//             });
//         }

//         // Create the new price comparison record
//         const newPriceComparison = await PriceComparison.create({
//             supplierName,
//             product,
//             priceQuoted,
//             deliveryTerms,
//             additionalBenefits,
//             recommendedSupplier: recommendedSupplier || false,
//         });

//         if (!newPriceComparison) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'Price comparison not created',
//             });
//         }

//         return res.status(201).json({
//             status: true,
//             message: 'Price comparison added successfully',
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message,
//         });
//     }
// };

const add_price_comparison = async (req, res) => {
    try {
        const { supplier1, supplier2, subcategoryId } = req.body;
        const { id: userId, userType } = req.user;

        // 🔐 ROLE GUARD - Only admin and superadmin can access
        if (!['admin', 'superadmin'].includes(userType)) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
            });
        }

        // Ensure both supplier IDs and product are provided
        if (!supplier1 || !supplier2 || !subcategoryId) {
            return res.status(400).json({
                status: false,
                message: "Please provide both supplier IDs and product service.",
            });
        }

        // Fetch both suppliers from the database
        const suppliers = await Supplier.findAll({
            where: { id: [supplier1, supplier2] },
            attributes: ['id', 'name', 'perUnitPrice'], // Fetch required fields
        });

        if (suppliers.length < 2) {
            return res.status(404).json({
                status: false,
                message: "One or both suppliers not found",
            });
        }

        // Extract supplier details
        const supplierOne = suppliers.find(s => s.id == supplier1);
        const supplierTwo = suppliers.find(s => s.id == supplier2);

        if (!supplierOne || !supplierTwo) {
            return res.status(404).json({
                status: false,
                message: "One or both suppliers not found",
            });
        }

        // Determine the recommended and not recommended supplier
        let recommendedSupplierId, recommendedSupplierName;
        let notRecommendedSupplierId, notRecommendedSupplierName;

        if (supplierOne.perUnitPrice < supplierTwo.perUnitPrice) {
            recommendedSupplierId = supplierOne.id;
            recommendedSupplierName = supplierOne.name;
            notRecommendedSupplierId = supplierTwo.id;
            notRecommendedSupplierName = supplierTwo.name;
        } else {
            recommendedSupplierId = supplierTwo.id;
            recommendedSupplierName = supplierTwo.name;
            notRecommendedSupplierId = supplierOne.id;
            notRecommendedSupplierName = supplierOne.name;
        }

        // Create the new price comparison record
        const newPriceComparison = await PriceComparison.create({
            supplier1,
            supplier2,
            subcategoryId,
            recommendedSupplierId,
            recommendedSupplierName, // Store recommended supplier name
            notRecommendedSupplierName, // Store not recommended supplier name
            userId,
        });

        if (!newPriceComparison) {
            return res.status(500).json({
                status: false,
                message: "Price comparison not created",
            });
        }

        return res.status(201).json({
            status: true,
            message: "Price comparison added successfully",
            recommendedSupplierId,
            recommendedSupplierName,
            notRecommendedSupplierId,
            notRecommendedSupplierName,
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Get all price comparisons
const get_all_price_comparisons = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1); // Ensure page is at least 1
        const limit = Math.max(parseInt(req.query.limit, 10) || 7, 1); // Ensure limit is at least 1
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

        const { rows: priceComparisons, count: totalRecords } = await PriceComparison.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Supplier, // Reference the actual model, not a string
                    as: "supplier",
                },
            ],
            limit,
            offset,
        });

        if (!priceComparisons.length) {
            return res.status(200).json({
                status: true,
                message: "No price comparisons found",
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
            message: "Price comparisons fetched successfully",
            data: priceComparisons,
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

// Update a price comparison
const update_price_comparison = async (req, res) => {
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

        const updatedPriceComparison = await PriceComparison.update(req.body, { where: whereClause });

        if (updatedPriceComparison[0] === 0) {
            return res.status(404).json({
                status: false,
                message: 'Price comparison not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Price comparison updated successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Delete a price comparison
const delete_price_comparison = async (req, res) => {
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

        const deletedPriceComparison = await PriceComparison.destroy({ where: whereClause });

        if (deletedPriceComparison === 0) {
            return res.status(404).json({
                status: false,
                message: 'Price comparison not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Price comparison deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

module.exports = {
    add_price_comparison,
    get_all_price_comparisons,
    update_price_comparison,
    delete_price_comparison,
};
