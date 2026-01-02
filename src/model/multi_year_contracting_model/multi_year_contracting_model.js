module.exports = (sequelize, DataTypes) => {
    const multi_year_contracting = sequelize.define('multi_year_contracting', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        supplierId: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        currentContractDuration: {
            type: DataTypes.STRING, 
            allowNull: false,
        },
        multiYearProposal: {
            type: DataTypes.STRING, 
            allowNull: false,
        },
        savingsEstimate: {
            type: DataTypes.DECIMAL(10, 2), 
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'Pending',
        },
        userId:{
            type: DataTypes.BIGINT,

        }
    });

    return multi_year_contracting;
};
