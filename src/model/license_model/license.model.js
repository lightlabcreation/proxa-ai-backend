// License Model - Sequelize definition for table structure
module.exports = (sequelize, DataTypes) => {
  const license = sequelize.define('license', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    admin_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'User ID of the admin this license belongs to'
    },
    license_key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    assigned_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('unused', 'active', 'revoked'),
      defaultValue: 'unused',
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'licenses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return license;
}

