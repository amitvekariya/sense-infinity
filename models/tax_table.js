'use strict';

// Import Package
const moment = require("moment-timezone");

// Import Config
const constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
  var taxTable = sequelize.define('tax_table', {
    hsn: DataTypes.INTEGER,
    sgst: DataTypes.FLOAT,
    cgst: DataTypes.FLOAT,
    igst: DataTypes.FLOAT,
    status: DataTypes.BOOLEAN
  }, {});
  taxTable.associate = function(models) {
    // associations can be defined here
  };
  return taxTable;
};


// Current Date and Time
const now = moment()
  .tz("Asia/Kolkata")
  .format("YYYY-MM-DD HH-m-ss");


/**
 * Start Database Read and Write
 */


// Read Tax Table Record
module.exports.readTax = async(select, taxId) => {
  try {
    // Create Mysql Connection
    const connection = await constants.createMysqlConnection();

    // Query
    const query = `SELECT ${select} FROM tax_tables WHERE tax_id = ?`;

    // Query Database
    const [rows, fields] = await connection.execute(query, [taxId]);

    connection.close();

    return rows;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Read Tax Table Record By Array
module.exports.readTaxByArray = async(select, marks, ids) => {
  try {
    // Create Mysql Connection
    const connection = await constants.createMysqlConnection();

    // Query
    const query = `SELECT ${select} FROM tax_tables WHERE tax_id IN (${marks})`;

    // Query Database
    const [rows, fields] = await connection.execute(query, ids);

    connection.close();

    return rows;
  } catch (error) {
    return Promise.reject(error);
  }
};


/**
 * End Database Read and Write
 */