const { Op ,Sequelize } = require("sequelize");
const db = require('../../../config/config');
const Transaction = db.transaction;
const category = db.category;
const supplier = db.supplier;
const department = db.department;
const get_spends_details = async (req, res) => {
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

        // Extract search filters from query params - now using IDs
        const { supplierId, transactionDate, categoryId, departmentId } = req.query;

        // Define the where clause for filtering
        const whereClause = {
            ...adminWhereClause
        };

        // Apply ID-based filters directly in where clause
        if (supplierId) {
            whereClause.supplierId = supplierId;
        }
        if (departmentId) {
            whereClause.departmentId = departmentId;
        }
        if (categoryId) {
            whereClause.categoryId = categoryId;
        }
        if (transactionDate) {
            whereClause.dateOfTransaction = transactionDate;
        }

        // Include clauses for related data (always include for display)
        const includeClause = [
            {
                model: department,
                as: "department",
                attributes: ['id', 'name'],
            },
            {
                model: supplier,
                as: "supplier",
                attributes: ['id', 'name'],
            },
            {
                model: category,
                as: "category",
                attributes: ['id', 'name'],
            }
        ];

        // Fetch paginated transactions with filters
        const { rows: transactions, count: totalRecords } = await Transaction.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            include: includeClause
        });

        // Calculate summary from full filtered dataset (not paginated)
        const summaryWhereClause = { ...whereClause };
        
        // Get total transaction count
        const totalSpendCount = await Transaction.count({
            where: summaryWhereClause
        });

        // Get total transaction amount from full filtered dataset
        const totalAmountResult = await Transaction.findAll({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount']
            ],
            where: summaryWhereClause,
            raw: true
        });
        const totalTransactionAmount = parseFloat(totalAmountResult[0]?.totalAmount || 0);

        // Get unique vendor count from full filtered dataset
        const uniqueVendorsResult = await Transaction.findAll({
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('supplierId'))), 'uniqueVendors']
            ],
            where: summaryWhereClause,
            raw: true
        });
        const totalVendorCount = parseInt(uniqueVendorsResult[0]?.uniqueVendors || 0);

        const totalPages = Math.ceil(totalRecords / limit);

        // Always return 200 OK, even for empty results
        return res.status(200).json({
            status: true,
            message: transactions.length > 0 ? 'Transactions fetched successfully' : 'No transactions found',
            data: transactions,
            summary: {
                totalSpendCount,
                totalTransactionAmount,
                totalVendorCount
            },
            pagination: {
                currentPage: page,
                totalPages: totalPages || 1,
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



const get_dashboard_spends_analytics = async (req, res) => {
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
                [Op.between]: [startDate, endDate],
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
                    model: supplier,
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
                    model: category,
                    as: "category",
                    attributes: [],
                },
            ],
            where: transactionWhereClause,
            group: ["month", "categoryId", "category.name"], // Ensure category grouping is correct
            order: [[Sequelize.fn("MIN", Sequelize.col("dateOfTransaction")), "ASC"]],
            raw: true, // Get plain results
        });

        return res.status(200).json({
            status: true,
            message: "Dashboard analytics fetched successfully",
            summary: {
                totalSpendCount: totalTransactions,
                totalSupplierCount: uniqueSuppliers,
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
    get_spends_details,

    get_dashboard_spends_analytics
};
