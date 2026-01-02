module.exports = (sequelize, DataTypes) => {
  const intake_request_comment = sequelize.define('intake_request_comment', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    requestId: {
      type: DataTypes.BIGINT,

    },
    userId: {
      type: DataTypes.BIGINT,
    },
    commentMessage: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userType: {
      type: DataTypes.STRING,

    }
  });

  return intake_request_comment;
};
