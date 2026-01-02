const { Op, Sequelize } = require("sequelize");
const db = require('../../../config/config');
const Transaction = db.transaction;
const Category = db.category;
const Supplier = db.supplier;
const IntakeRequest = db.intake_request; // Assuming you have this model
const Contract = db.contract; // Assuming you have this model
const moment = require('moment');

const get_dashboard_data = async (req, res) => {
    try {
        // Check user role for data filtering
        const userType = req.user?.userType;
        const userId = req.user?.id;
        const isSuperAdmin = userType === 'superadmin';
        
        // Build where clause for Admin users (filter by userId)
        const adminWhereClause = isSuperAdmin ? {} : { userId: userId };
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - 5); // Last 6 months (including current month)

        // Get total transaction count (filtered for Admin users)
        const totalTransactions = await Transaction.count({
            where: adminWhereClause
        });

        // Get unique suppliers count (filtered for Admin users)
        const uniqueSuppliers = await Transaction.count({
            distinct: true,
            col: "supplierId",
            where: adminWhereClause
        });

        // Build where clause for transactions with date filter
        const transactionWhereClause = {
            dateOfTransaction: {
                [Op.gte]: startDate,
                [Op.lte]: endDate,
            },
            ...(isSuperAdmin ? {} : { userId: userId })
        };

        // Fetch top 5 suppliers by total transaction amount (filtered for Admin users)
        const topSuppliers = await Transaction.findAll({
            attributes: [
                "supplierId",
                [Sequelize.fn("SUM", Sequelize.col("amount")), "totalAmount"],
            ],
            include: [
                {
                    model: Supplier,
                    as: "supplier",
                    attributes: ["name"],
                },
            ],
            where: transactionWhereClause,
            group: ["supplierId", "supplier.name"], // Group correctly
            order: [[Sequelize.fn("SUM", Sequelize.col("amount")), "DESC"]],
            limit: 5,
            raw: true, // Ensure clean results
        });

        const barGraphData = topSuppliers.map((supplierData) => ({
            topSupplier: supplierData["supplier.name"], // Access nested object properly
            totalAmount: parseFloat(supplierData.totalAmount),
        }));

        // Fetch total spend per category for each month (filtered for Admin users)
        const monthlyCategoryData = await Transaction.findAll({
            attributes: [
                [Sequelize.fn("DATE_FORMAT", Sequelize.col("dateOfTransaction"), "%b %Y"), "month"], // "Jan 2025"
                [Sequelize.fn("SUM", Sequelize.col("amount")), "totalAmount"],
                [Sequelize.col("category.name"), "categoryName"],
            ],
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: [],
                },
            ],
            where: transactionWhereClause,
            group: ["month", "categoryId", "category.name"], // Ensure category grouping is correct
            order: [[Sequelize.fn("MIN", Sequelize.col("dateOfTransaction")), "ASC"]], // Order by the earliest date in the selected range
            raw: true, // Get plain results
        });

        // Fetch total intake requests (filtered for Admin users)
        const totalIntakeRequests = await IntakeRequest.count({
            where: adminWhereClause
        });

        // Fetch total contracts expiring soon (next 30 days) (filtered for Admin users)
        const expiringContracts = await Contract.count({
            where: {
                endDate: {  // Use the correct column name if needed
                    [Op.between]: [moment().toDate(), moment().add(30, 'days').toDate()],
                },
                ...(isSuperAdmin ? {} : { userId: userId })
            },
        });
        return res.status(200).json({
            status: true,
            message: "Dashboard analytics fetched successfully",
            summary: {
                totalSpendCount: totalTransactions,
                totalSupplierCount: uniqueSuppliers,
                totalIntakeRequests: totalIntakeRequests, // Added total intake requests count
                totalExpiringContracts: expiringContracts, // Added expiring contracts count
            },
            topSuppliers: barGraphData,
            categoryData: monthlyCategoryData,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

module.exports = {
    get_dashboard_data
};
