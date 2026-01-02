module.exports = (sequelize, DataTypes) => {
    const old_pricing = sequelize.define('old_pricing', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        supplierId: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        categoryId: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        subcategoryId:{
            type: DataTypes.BIGINT,
        },
        oldPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        productPurchased:{
            type: DataTypes.STRING,

        },
        currentQuotation: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        savingFromOldPricing: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'Pending', 
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
    });

    return old_pricing;
};
