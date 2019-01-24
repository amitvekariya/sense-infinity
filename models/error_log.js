'use strict';

// Import Package
const moment = require('moment-timezone');

// Import Config
const constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
  var ErrorLog = sequelize.define(
    'error_log',
    {
      error: DataTypes.TEXT,
      value: DataTypes.TEXT
    },
    {
      classMethods: {
        associate: function(models) {
          // associations can be defined here
        }
      }
    }
  );
  return ErrorLog;
};

// Current Date and Time
const now = moment()
  .tz('Asia/Kolkata')
  .format('YYYY-MM-DD HH-m-ss');

/**
 * Start Database Read and Write
 */

// Keep Into Error Log
module.exports.keepErrorLog = async (error, value) => {
  try {
    // Create Mysql Connection
    const connection = await constants.createMysqlConnection();

    // Query
    const query = 'INSERT INTO `error_logs` (`error`, `value`, `created_at`,`updated_at`) VALUES (?,?,?,?)';

    // Query Database
    const row = await connection.execute(query, [error, value, now, now]);

    connection.close();

    return row;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * End Database Read and Write
 */
