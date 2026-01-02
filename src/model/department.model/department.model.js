module.exports = (sequelize, DataTypes) => {
  const department = sequelize.define('department', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    email_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    refreshToken_Expiration: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.BIGINT,
    },
    permissions: {
      type: DataTypes.JSON,

    },
    role: {
      type: DataTypes.STRING,

    },
    notEncryptPassword: {
      type: DataTypes.STRING,

    },
    type: {
      type: DataTypes.STRING,

    }

  });


  return department;
};
