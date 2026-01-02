const db = require("../../../config/config");

const SupplierRating = db.supplier_rating;
const Supplier = db.supplier;
const add_rating = async (req, res) => {
    const userId = req.user.id;
    try {
        const { supplierId, ratings, totalRating } = req.body;

        // Validate required fields
        if (!supplierId || ratings === undefined || totalRating === undefined) {
            return res.status(400).json({
                status: false,
                message: "Supplier ID, rating, and totalRating are required",
            });
        }

        // Find existing rating entry for the supplier
        let supplierRating = await SupplierRating.findOne({ where: { supplierId } });

        if (!supplierRating) {
            // If no record exists, create a new one
            supplierRating = await SupplierRating.create({
                supplierId,
                ratings: [ratings], // Store rating in array format
                totalRating, // Use totalRating from frontend
                userId
            });
        } else {
            // Update the existing record
            const updatedRatings = [...supplierRating.ratings, ratings];

            await supplierRating.update({
                ratings: updatedRatings,
                totalRating, // Use totalRating from frontend
            });
        }

        return res.status(201).json({
            status: true,
            message: "Rating added successfully!",
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};
const get_ratings = async (req, res) => {
    try {
        const { supplierId1, supplierId2 } = req.body;

        if (!supplierId1 || !supplierId2) {
            return res.status(400).json({
                status: false,
                message: "Both supplier IDs are required",
            });
        }

        // Fetch supplier details (names)
        const supplier1 = await Supplier.findOne({ where: { id: supplierId1 } });
        const supplier2 = await Supplier.findOne({ where: { id: supplierId2 } });

        if (!supplier1 || !supplier2) {
            return res.status(404).json({
                status: false,
                message: "One or both suppliers not found",
            });
        }

        // Fetch supplier ratings
        const supplierRating1 = await SupplierRating.findOne({ where: { supplierId: supplierId1 } });
        const supplierRating2 = await SupplierRating.findOne({ where: { supplierId: supplierId2 } });

        if (!supplierRating1 || !supplierRating2) {
            return res.status(404).json({
                status: false,
                message: "One or both suppliers have no rating. Please provide ratings first.",
            });
        }

        // Compare total ratings and determine the best supplier
        let bestSupplier = "Both suppliers have equal ratings";
        if (supplierRating1.totalRating > supplierRating2.totalRating) {
            bestSupplier = supplier1.name; // Supplier name from the Supplier table
        } else if (supplierRating2.totalRating > supplierRating1.totalRating) {
            bestSupplier = supplier2.name; // Supplier name from the Supplier table
        }

        return res.status(200).json({
            status: true,
            message: "Ratings fetched successfully",
            ratings: [
                {
                    supplierId: supplierId1,
                    supplierName: supplier1.name,
                    totalRating: supplierRating1.totalRating,
                    kpiData: supplierRating1.ratings,
                },
                {
                    supplierId: supplierId2,
                    supplierName: supplier2.name,
                    totalRating: supplierRating2.totalRating,
                    kpiData: supplierRating2.ratings,
                },
            ],
            bestSupplier: bestSupplier,
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

module.exports = {
    add_rating,
    get_ratings
};
