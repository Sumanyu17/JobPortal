const { Sequelize, Model, DataTypes } = require("sequelize");

const User = global.databaseConnection.define("users", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    primaryKey: true
  },
  phoneNumber: {
    type: DataTypes.STRING(255),
    required: true, unique: true
  },
  emailId: {
    type: DataTypes.STRING(255),
    required: true, unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    required: true
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    required: true,
  }
});

module.exports = User;