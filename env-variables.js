let config = {
    databaseName: 'testing_db',
    dbuser: 'root',
    password: 'p@ssw0rd',
    dbconnection: {
      host: 'localhost',
      dialect: 'mysql'
    },
    jwtSecret: "myjwtsecret",
    port: 3000
  }
  
  module.exports = config;
  