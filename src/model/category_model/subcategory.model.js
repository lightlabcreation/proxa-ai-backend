// models/subcategory.js

module.exports = (sequelize, DataTypes) => {
    const subcategory = sequelize.define('subcategory', {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userId:{
        type: DataTypes.BIGINT,

      }
    }, {
      tableName: 'subcategories',
      timestamps: true,
    });
  
    return subcategory;
  };
  