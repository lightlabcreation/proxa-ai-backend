// models/User.js
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM,
      values: ["male", "female", "other"],
      allowNull: true,
    },
    phone_no: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userType: {
      type: DataTypes.STRING,
      allowNull: true

    },
    profile_image: {
      type: DataTypes.STRING,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    refreshToken_Expiration: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    otp: {
      type: DataTypes.STRING,
    },
    otp_verify: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
    is_verify: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0
    },
    isapprovalFlow: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }

  },
  );

  return user;
}