module.exports = (sequelize, DataTypes) => {
  const contract_template = sequelize.define(
    'contract_template',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },

      // 🔐 OWNERSHIP (MOST IMPORTANT)
      admin_id: {
        type: DataTypes.BIGINT,
        allowNull: true, // null = superadmin/global template
      },

      newSupplier: {
        type: DataTypes.STRING,
        defaultValue: false,
      },

      existingSupplier: {
        type: DataTypes.STRING,
        defaultValue: false,
      },

      extendExistingContract: {
        type: DataTypes.STRING,
        defaultValue: false,
      },

      letterOfExtension: {
        type: DataTypes.STRING,
        defaultValue: false,
      },

      customAgreementFile: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      aggrementName: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: 'contract_templates',
      timestamps: true,
    }
  );

  return contract_template;
};
