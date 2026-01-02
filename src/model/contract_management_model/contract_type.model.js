module.exports = (sequelize, DataTypes) => {
  const contract_type = sequelize.define('contract_type', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: true

    }
  });

  return contract_type;
};
