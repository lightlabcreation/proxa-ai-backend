module.exports = (sequelize, DataTypes) => {
    const intake_request_approvers = sequelize.define('intake_request_approvers', {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
  
      intakeRequestId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      userType:{
       type:DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
      },
      comments: {
        type: DataTypes.TEXT,
        allowNull: true, 
      },
    });
  
    return intake_request_approvers;
  };
  