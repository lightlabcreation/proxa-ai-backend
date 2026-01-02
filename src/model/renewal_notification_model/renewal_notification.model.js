module.exports = (sequelize, DataTypes) => {

  const renewal_notification = sequelize.define('renewal_notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    contractType: {
      type: DataTypes.JSON, 
      allowNull: false,
    },
    remindBeforeDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 7
    },
    emailSubject: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Reminder: Contract Renewal Approaching'
    },
    emailBody: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: `
      Dear [Recipient's Name],

      This is a friendly reminder that your [Contract Type] contract is approaching its renewal date. Please review the details and take action if necessary.

      Regards,  
      [Your Company Name]
    `
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });
  return renewal_notification;
}
