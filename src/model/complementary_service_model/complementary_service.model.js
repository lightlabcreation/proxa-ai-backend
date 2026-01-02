module.exports = (sequelize, DataTypes) => {
    const complementary_service = sequelize.define('complementary_service', {
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
        productPurchased:{
            type: DataTypes.STRING,
        },
        complementaryService: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        saving: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'proposed', 
        },
        userId:{
            type: DataTypes.BIGINT,
        }
    });

    return complementary_service;
};
