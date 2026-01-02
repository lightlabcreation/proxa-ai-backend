// Notification Model
module.exports = (sequelize, DataTypes) => {
  const notification = sequelize.define('notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'license_expiry, license_expired, renewal_request, renewal_approved'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    target_user_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'NULL for SuperAdmin notifications, user_id for Admin notifications'
    },
    target_role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'superadmin or admin'
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    related_license_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return notification;
}

