const db = require('../../../config/config');
const Transaction = db.transaction;
const Category = db.category;
const Subcategory = db.subcategories;
const Supplier = db.supplier;

const get_all_volume_discounts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { id: userId, userType } = req.user;

    // 🔐 ROLE GUARD
    if (!['admin', 'superadmin'].includes(userType)) {
      return res.status(401).json({
        status: false,
        message: 'Unauthorized',
      });
    }

    // 🔐 ADMIN ISOLATION
    const transactionWhere = {
      categoryId: { [db.Sequelize.Op.ne]: null },
      subcategoryId: { [db.Sequelize.Op.ne]: null },
    };

    if (userType === 'admin') {
      transactionWhere.userId = userId;
    }

    const transactions = await Transaction.findAll({
      where: transactionWhere,
      include: [
        { model: Category, as: 'category', attributes: ['name'] },
        { model: Subcategory, as: 'subcategory', attributes: ['name'] },
      ],
    });

    if (!transactions.length) {
      return res.status(200).json({
        status: true,
        data: [],
        message: 'No volume discounts found',
      });
    }

    // 🔁 AGGREGATION
    const aggregatedMap = {};

    for (const tx of transactions) {
      const key = `${tx.categoryId}_${tx.subcategoryId}`;

      if (!aggregatedMap[key]) {
        aggregatedMap[key] = {
          categoryId: tx.categoryId,
          subcategoryId: tx.subcategoryId,
          subcategoryName: tx.subcategory?.name || 'N/A',
          totalUnits: 0,
        };
      }

      aggregatedMap[key].totalUnits += Number(tx.unit || 0);
    }

    const aggregatedData = Object.values(aggregatedMap);
    const paginatedData = aggregatedData.slice(offset, offset + limit);

    const result = await Promise.all(
      paginatedData.map(async (item) => {
        const supplierWhere = {
          categoryId: item.categoryId,
          subcategoryId: item.subcategoryId,
        };

        if (userType === 'admin') {
          supplierWhere.userId = userId;
        }

        const suppliers = await Supplier.findAll({ where: supplierWhere });

        if (!suppliers.length) {
          return { ...item, bestSupplier: null };
        }

        const bestSupplier =
          suppliers.length === 1
            ? suppliers[0]
            : suppliers.reduce((best, current) =>
                current.maxUnitPurchase * current.discountPercent >
                best.maxUnitPurchase * best.discountPercent
                  ? current
                  : best
              );

        const estimatedSavings =
          bestSupplier.maxUnitPurchase *
          bestSupplier.perUnitPrice *
          (bestSupplier.discountPercent / 100);

        return {
          ...item,
          bestSupplier: {
            supplierId: bestSupplier.id,
            supplierName: bestSupplier.name,
            maxUnitPurchase: bestSupplier.maxUnitPurchase,
            discountPercent: bestSupplier.discountPercent,
            perUnitPrice: bestSupplier.perUnitPrice,
            estimatedSavings,
            volumeDiscountStatus: bestSupplier.volumeDiscountStatus,
          },
        };
      })
    );

    return res.status(200).json({
      status: true,
      message: 'Volume discounts fetched successfully',
      data: result,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(aggregatedData.length / limit),
        totalRecords: aggregatedData.length,
        limit,
      },
    });
  } catch (error) {
    console.error('Volume discount error:', error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = { get_all_volume_discounts };
