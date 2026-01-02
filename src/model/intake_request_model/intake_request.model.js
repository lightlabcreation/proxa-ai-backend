module.exports = (sequelize, DataTypes) => {

  const intake_request = sequelize.define('intake_request', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },

    requestType: {
      type: DataTypes.STRING,
    },
    categoryId: {
      type: DataTypes.BIGINT,
    },
    subcategory: {
      type: DataTypes.STRING,
    },
    engagementType: {
      type: DataTypes.STRING,
    },
    itemDescription: {
      type: DataTypes.TEXT,
    },
    quantity: {
      type: DataTypes.INTEGER,
    },
    duration: {
      type: DataTypes.STRING,
    },
    expectedDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null, 
    },
    executionTimeline: {
      type: DataTypes.STRING,
    },
    reasonForEarlierExecution: {
      type: DataTypes.TEXT,
    },
    serviceDuration: {
      type: DataTypes.STRING, // Example: "6 months, 1 year"
    },
    amendmentType: {
      type: DataTypes.STRING,
    },
    contractDocument: {
      type: DataTypes.STRING, // Stores file path
      allowNull: true,
    },
    intakeAttachement: {
      type: DataTypes.STRING, // Stores file path

    },
    budgetCode: {
      type: DataTypes.STRING,
    },
    requestedAmount: {
      type: DataTypes.FLOAT,
    },
    requesterName: {
      type: DataTypes.STRING,
    },
    requesterDepartmentId: {
      type: DataTypes.BIGINT,
    },
    requesterEmail: {
      type: DataTypes.STRING,
    },
    requesterContactNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    additionalDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'active'),
      defaultValue: 'pending',
    },
    assignStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    userId: {
      type: DataTypes.BIGINT,
    },
    supplierEmail: {
      type: DataTypes.STRING,

    },
    supplierName: {
      type: DataTypes.STRING,

    },
    supplierContact: {
      type: DataTypes.STRING,

    },
    startDate: {
      type: DataTypes.TEXT,

    },
    endDate: {
      type: DataTypes.TEXT,

    },
    involvesCloud: {
      type: DataTypes.BOOLEAN,
      defaultValue: false

    },
    shareCustomerOrEmployeeInfo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false

    },
    assigncontractTemplateId:{
      type:DataTypes.BIGINT
    }


  });
  return intake_request;
}
