const { toDefaultValue } = require("sequelize/lib/utils");

module.exports = (sequelize, DataTypes) => {
  const renewal_request = sequelize.define('renewal_request', {
    contractId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    amendments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    previousExpirationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    newExpirationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    additionalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    selectDepartment: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    renewalAttachmentFile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Pending Renewal",
    },
    vendorName:{
      type: DataTypes.STRING,
      allowNull: true,

    },
    contractPrice:{
      type: DataTypes.STRING,
      allowNull: true,

    },
    addService:{
      type: DataTypes.STRING,
      allowNull: true,

    }

  }, {
    tableName: 'renewal_requests',
    timestamps: true,
  });

  return renewal_request;
};
