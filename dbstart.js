const Sequelize = require("sequelize");
const config = require("./env-variables")
global.databaseConnection = new Sequelize(config.databaseName, config.dbuser, config.password, config.dbconnection);

(async function validateConnection() {
  try {
    await global.databaseConnection.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

let models = require('./model-collection');
global.databaseConnection.Models = models;
(async () => {
  await global.databaseConnection.sync({force: true});
})();

