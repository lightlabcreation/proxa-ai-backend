const db = require('../../../config/config');
const { Op } = require("sequelize");
const Sequelize = require("sequelize")
const SupplierConsolidation = db.supplier_consolidation;
const Transaction = db.transaction;
const Supplier = db.supplier ;
const Category = db.category;
// Add a new supplier consolidation
const add_supplier_consolidation = async (req, res) => {
    try {
        const { categoryName, currentSupplier, spendWithEachSupplier, recommendedSupplier, potentialSaving, status } = req.body;

        // Check if required fields are empty
        const requiredFields = ['categoryName', 'currentSupplier', 'spendWithEachSupplier', 'recommendedSupplier'];
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

        // Create the new supplier consolidation
        const newSupplierConsolidation = await SupplierConsolidation.create({
            categoryName,
            currentSupplier,
            spendWithEachSupplier,
            recommendedSupplier,
            potentialSaving,
            status: status || 'Pending',
        });

        if (!newSupplierConsolidation) {
            return res.status(404).json({
                status: false,
                message: 'Supplier consolidation not created',
            });
        }

        return res.status(201).json({
            status: true,
            message: 'Supplier consolidation added successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Get all supplier consolidations
// const get_all_supplier_consolidations = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 7;
//         const offset = (page - 1) * limit;

//         const { rows: supplierConsolidations, count: totalRecords } = await SupplierConsolidation.findAndCountAll({
//             limit,
//             offset,
//         });

//         if (supplierConsolidations.length === 0) {
//             return res.status(404).json({
//                 status: false,
//                 message: 'No supplier consolidations found',
//                 data: [],
//             });
//         }

//         const totalPages = Math.ceil(totalRecords / limit);

//         return res.status(200).json({
//             status: true,
//             message: 'Supplier consolidations fetched successfully',
//             data: supplierConsolidations,
//             pagination: {
//                 currentPage: page,
//                 totalPages,
//                 totalRecords,
//                 limit,
//             },
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: false,
//             message: error.message,
//         });
//     }
// };

const get_all_supplier_consolidations = async (req, res) => {
    try {
      // Pagination parameters
      const page = parseInt(req.query.page, 10) || 1; // Default to page 1
      const limit = parseInt(req.query.limit, 10) || 7; // Default to 7 records per page
      const offset = (page - 1) * limit; // Calculate offset based on page number and limit
  
      const { id: userId, userType } = req.user;

      // 🔐 ROLE GUARD - Only admin and superadmin can access
      if (!['admin', 'superadmin'].includes(userType)) {
        return res.status(401).json({
          status: false,
          message: 'Unauthorized',
        });
      }

      // 🔐 ADMIN ISOLATION - Build where clause based on user type
      const transactionWhere = {};
      if (userType === 'admin') {
        transactionWhere.userId = userId;
      }

      // Fetch transactions grouped by categoryId and supplierId with pagination
      const { rows: transactions, count: totalRecords } = await Transaction.findAndCountAll({
        attributes: [
          "categoryId",
          "supplierId",
          [Sequelize.fn("SUM", Sequelize.col("amount")), "totalSpent"],
        ],
        where: transactionWhere,
        include: [
          { model: Supplier, as: "supplier", attributes: ["id", "name"] },
          { model: Category, as: "category", attributes: ["id", "name"] },
        ],
        group: ["categoryId", "supplierId", "supplier.id", "category.id"],
        limit,
        offset,
        raw: true,
        nest: true,
      });
      // If no supplier consolidations are found
      if (transactions.length === 0) {
        return res.status(200).json({
          status: true,
          message: 'No supplier consolidations found',
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalRecords: 0,
            limit,
          },
        });
      }
  
      // Organize data by categoryId
      const categories = {};
      transactions.forEach((transaction) => {
        const { categoryId, supplier, category, totalSpent } = transaction;
  
        if (!categories[categoryId]) {
          categories[categoryId] = {
            categoryId,
            categoryName: category.name,
            currentSuppliers: [],
            recommendedSupplier: null,
            potentialSavings: 0,
          };
        }
  
        // Add supplier data to currentSuppliers
        categories[categoryId].currentSuppliers.push({
          supplierId: supplier.id,
          supplierName: supplier.name,
          spend: parseFloat(totalSpent),
        });
      });
  
      // Calculate recommended suppliers and savings
      Object.values(categories).forEach((category) => {
        category.currentSuppliers.sort((a, b) => a.spend - b.spend);
  
        const recommended = category.currentSuppliers[0];
        category.recommendedSupplier = {
          supplierId: recommended.supplierId,
          supplierName: recommended.supplierName,
          spend: recommended.spend,
        };
  
        const maxSpend = Math.max(...category.currentSuppliers.map((s) => s.spend));
        category.potentialSavings = maxSpend - recommended.spend;
      });
  
      // Calculate total pages for pagination based on totalRecords
      const totalPages = Math.ceil(totalRecords.length / limit);
       
      // Send paginated response
      return res.status(200).json({
        status: true,
        message: 'Supplier consolidations fetched successfully',
        data: Object.values(categories),
        pagination: {
          currentPage: page,
          totalPages,  // The number of pages available
          totalRecords:totalRecords.length,  // The total number of records
          limit,  // The limit per page
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
  
// Update a supplier consolidation
const update_supplier_consolidation = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedSupplierConsolidation = await SupplierConsolidation.update(req.body, { where: { id } });

        if (updatedSupplierConsolidation[0] === 0) {
            return res.status(404).json({
                status: false,
                message: 'Supplier consolidation not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Supplier consolidation updated successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Delete a supplier consolidation
const delete_supplier_consolidation = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSupplierConsolidation = await SupplierConsolidation.destroy({ where: { id } });

        if (deletedSupplierConsolidation === 0) {
            return res.status(404).json({
                status: false,
                message: 'Supplier consolidation not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Supplier consolidation deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

module.exports = {
    add_supplier_consolidation,
    get_all_supplier_consolidations,
    update_supplier_consolidation,
    delete_supplier_consolidation,
};
