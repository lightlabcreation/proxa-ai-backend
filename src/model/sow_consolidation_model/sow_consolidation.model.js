module.exports = (sequelize, DataTypes) => {
    const service_sow_consolidation = sequelize.define('service_sow_consolidation', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        requestedTeamDepartmentId: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        requestedServiceTool: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        existingSupplierServiceId: {
            type: DataTypes.BIGINT, 
            allowNull: true,
        },
        consolidationSavings: {
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


    return service_sow_consolidation;
};
