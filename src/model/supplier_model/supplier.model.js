module.exports = (sequelize, DataTypes) => {
  const supplier = sequelize.define('supplier', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[0-9]{10,15}$/,
          msg: "Please enter a valid phone number with 10  digits (numbers only, no spaces or symbols).",
        },
      },
    },
    address: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Active',
    },
    categoryId: {
      type: DataTypes.BIGINT,

    },
    subcategoryId: {
      type: DataTypes.BIGINT,

    },
    departmentId: {
      type: DataTypes.BIGINT,
    },
    userId: {
      type: DataTypes.BIGINT,
    },
    perUnitPrice: {
      type: DataTypes.BIGINT,

    }, maxUnitPurchase: {
      type: DataTypes.BIGINT,

    }, discountPercent: {
      type: DataTypes.BIGINT,

    },
    deliveryTerms: {
      type: DataTypes.STRING,
    },
    additionalBenefits: {
      type: DataTypes.TEXT,
    },

    volumeDiscountStatus: {
      type: DataTypes.STRING,
      defaultValue: "New Opportunity"
    },
    
  });

  return supplier;
};
