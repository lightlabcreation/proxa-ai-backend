module.exports = (sequelize, DataTypes) => {
    const procurement_request_approvers = sequelize.define('procurement_request_approvers', {
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
    });
  
    return procurement_request_approvers  ;
  };
  