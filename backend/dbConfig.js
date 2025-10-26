const sql = require("mssql");

const config = {
  user: "sa",
  password: "Ozzy112358",
  server: "192.168.1.29", // or your SQL Server host
  database: "calculator",
  options: {
    encrypt: false, // set to true if you're using Azure
    trustServerCertificate: true,
  },
};

module.exports = config;
