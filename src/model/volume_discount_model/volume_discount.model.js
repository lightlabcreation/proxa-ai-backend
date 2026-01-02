module.exports = (sequelize, DataTypes) => {
    const volume_discount = sequelize.define(
      'volume_discount',
      {
        id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          autoIncrement: true,
        },
  
        // 🔐 DATA OWNERSHIP
        admin_id: {
          type: DataTypes.BIGINT,
          allowNull: true, // NULL = SuperAdmin / Global
          comment: 'Admin ID this volume discount belongs to',
        },
  
        categoryId: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
  
        historicalVolumePurchased: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
  
        discountThreshold: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
  
        estimatedSavings: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
  
        recommendedSupplierId: {
          type: DataTypes.BIGINT,
          allowNull: true,
        },
  
        status: {
          type: DataTypes.STRING,
          defaultValue: 'Active',
        },
      },
      {
        tableName: 'volume_discounts',
        timestamps: true,
      }
    );
  
    return volume_discount;
  };
  