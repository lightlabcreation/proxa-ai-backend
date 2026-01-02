module.exports = (sequelize, DataTypes) => {
    const supplier_rating = sequelize.define("supplier_rating", {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      supplierId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      ratings: {
        type: DataTypes.JSON, // Stores an array of ratings
        defaultValue: [],
        allowNull: false,
      },
      totalRating: {
        type: DataTypes.FLOAT, // Stores the average rating
        defaultValue: 0,
      },
      userId:{
        type: DataTypes.BIGINT,

      }
    });
  
    return supplier_rating;
  };
  