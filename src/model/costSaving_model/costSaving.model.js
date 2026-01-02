// models/CostSaving.js
module.exports = (sequelize, DataTypes) => {
    const costSaving = sequelize.define('costSaving', {
        // Basic form fields
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },

        supplierName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        depreciationScheduleYears: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        group: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false
        },
        reportingYear: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false
        },
        benefitStartMonth: {
            type: DataTypes.STRING,
            allowNull: false
        },
        typeOfCostSaving: {
            type: DataTypes.STRING,
            allowNull: false
        },
        historicalUnitPrice: {
            type: DataTypes.STRING,
            allowNull: false
        },
        negotiatedUnitPrice: {
            type: DataTypes.STRING,
            allowNull: false
        },
        reductionPerUnit: {
            type: DataTypes.STRING,
            allowNull: false
        },

        // Forecasted Volumes (store as JSON)
        forecastVolumes: {
            type: DataTypes.JSON,
            allowNull: false
        },

        // Sourcing Benefits (store as JSON)
        sourcingBenefits: {
            type: DataTypes.JSON,
            allowNull: false
        },
        intakeRequest: {
            type: DataTypes.BIGINT,

        }
    });

    return costSaving;
};
