const db = require('../../../config/config');
const Transaction = db.transaction;

// Add a new transaction
const add_transaction = async (req, res) => {
    const userId = req.user.id;
    try {
        const { dateOfTransaction, supplierId, departmentId, categoryId, amount, year, quarter,unit,subcategoryId } = req.body;

        // Check if required fields are empty
        const requiredFields = ['dateOfTransaction', 'supplierId', 'departmentId', 'categoryId', 'amount', 'year', 'quarter','subcategoryId'];
        const isEmptyKey = requiredFields.some(field => {
            const value = req.body[field];
            return value === null || value === undefined || value === '';
        });

        if (isEmptyKey) {
            return res.status(400).json({
                status: false,
                message: 'Please fill in all required fields',
            });
        }

        // Create the new transaction
        const newTransaction = await Transaction.create({
            dateOfTransaction,
            supplierId,
            departmentId,
            categoryId,
            amount,
            year,
            quarter,
            unit,
            subcategoryId,
            userId
        });

        if (!newTransaction) {
            return res.status(500).json({
                status: false,
                message: 'Transaction not created',
            });
        }

        return res.status(201).json({
            status: true,
            message: 'Transaction added successfully',
            data: newTransaction,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Get all transactions
const get_all_transactions = async (req, res) => {
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

        const { rows: transactions, count: totalRecords } = await Transaction.findAndCountAll({
            where: adminWhereClause,
            limit,
            offset,
        });

        if (transactions.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No transactions found',
                data: [],
            });
        }

        const totalPages = Math.ceil(totalRecords / limit);

        return res.status(200).json({
            status: true,
            message: 'Transactions fetched successfully',
            data: transactions,
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

// Update a transaction
const update_transaction = async (req, res) => {
    try {
        // Check user role for data filtering
        const userType = req.user?.userType;
        const userId = req.user?.id;
        const isSuperAdmin = userType === 'superadmin';
        
        const { id } = req.params;

        // Build where clause - Admin users can only update their own transactions
        const whereClause = { id };
        if (!isSuperAdmin && userId) {
          whereClause.userId = userId;
        }

        const updatedTransaction = await Transaction.update(req.body, { where: whereClause });

        if (updatedTransaction[0] === 0) {
            return res.status(404).json({
                status: false,
                message: 'Transaction not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Transaction updated successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Delete a transaction
const delete_transaction = async (req, res) => {
    try {
        // Check user role for data filtering
        const userType = req.user?.userType;
        const userId = req.user?.id;
        const isSuperAdmin = userType === 'superadmin';
        
        const { id } = req.params;

        // Build where clause - Admin users can only delete their own transactions
        const whereClause = { id };
        if (!isSuperAdmin && userId) {
          whereClause.userId = userId;
        }

        const deletedTransaction = await Transaction.destroy({ where: whereClause });

        if (deletedTransaction === 0) {
            return res.status(404).json({
                status: false,
                message: 'Transaction not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Transaction deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

module.exports = {
    add_transaction,
    get_all_transactions,
    update_transaction,
    delete_transaction,
};
