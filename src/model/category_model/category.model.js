// models/category.js

module.exports = (sequelize, DataTypes) => {
    const category = sequelize.define('category', {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type:{
        type: DataTypes.STRING,

      },
      description: {
        type: DataTypes.STRING,
        allowNull: true, 
      },
      userId:{
        type: DataTypes.BIGINT,

      }
    }, {
      tableName: 'categories', 
      timestamps: true, 
    });
  
    return category;
  };
  