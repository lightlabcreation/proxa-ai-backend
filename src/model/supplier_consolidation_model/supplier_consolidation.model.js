module.exports = (sequelize, DataTypes) => {
    const supplier_consolidation = sequelize.define('supplier_consolidation', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        categoryName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        currentSupplier: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        spendWithEachSupplier: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        recommendedSupplier: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        potentialSaving: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'Pending',
        },
    });

    return supplier_consolidation;
};
