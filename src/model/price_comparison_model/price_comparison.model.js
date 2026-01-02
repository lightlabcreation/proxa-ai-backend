
module.exports = (sequelize, DataTypes) => {
    const price_comparison = sequelize.define('price_comparison', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        supplier1: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        subcategoryId: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        supplier2: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        
        recommendedSupplierId: {
            type: DataTypes.BIGINT,
        },
        recommendedSupplierName:{
            type: DataTypes.STRING,

        }, 
        notRecommendedSupplierName:{
            type: DataTypes.STRING,

        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },

    });

    return price_comparison;
};
