module.exports = (sequelize, DataTypes) => {
    const assign_intake_request = sequelize.define('assign_intake_request', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },

        requestId: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        supplierId: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        assignedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        userId:{
            type: DataTypes.BIGINT,

        }
    }, {
        timestamps: true,
        tableName: 'assign_intake_request',
    });

    return assign_intake_request;
};
