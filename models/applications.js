const { Sequelize, Model, DataTypes } = require("sequelize");

const Applications = global.databaseConnection.define("applications", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    primaryKey: true
  }
})
  Applications.belongsTo(global.databaseConnection.models.users, {
    foreignKey: 'userId', onDelete: 'cascade', hooks: true
  });
  Applications.belongsTo(global.databaseConnection.models.jobs, {
    foreignKey: 'jobId', onDelete: 'cascade', hooks: true
  });

module.exports = Applications;