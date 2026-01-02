module.exports = (sequelize, DataTypes) => {
    const contract = sequelize.define("contract", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },

        contractName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        contractTypeId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        departmentId: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        sourceLeadName: {
            type: DataTypes.STRING,

        },
        sourceDirectorName: {
            type: DataTypes.STRING,

        },
        buisnessStackHolder: {
            type: DataTypes.STRING,

        },
        supplierId: {
            type: DataTypes.BIGINT,

        },
        agreementId:{
            type: DataTypes.BIGINT,

        },
        budget: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        paymentTerms: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        milestones: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        contractAttachmentFile: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        approvers: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        approvalLevels: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        thresholdRules: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        userId: {
            type: DataTypes.BIGINT,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: "Active"
        }
    },);

    return contract;
};
