"use strict";

const moment = require("moment");
const mysql = require("mysql2/promise");
const dotEnv = require("dotenv");

module.exports = (sequelize, DataTypes) => {
  var sms = sequelize.define(
    "sms",
    {
      mobile: DataTypes.STRING,
      otp: DataTypes.STRING,
      gateway_status: DataTypes.STRING,
      status: DataTypes.BOOLEAN
    },
    {}
  );
  sms.associate = function(models) {
    // associations can be defined here
  };
  return sms;
};

// Current Date and Time
const now = moment()
  .tz("Asia/Kolkata")
  .format("YYYY-MM-DD HH-m-ss");

/**
 * Start Database Read and Write
 */

// Keep Into Sms
module.exports.keepSmsOtp = async (mobile, otp, status) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      port: process.env.DB_PORT,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    // Query
    const query =
      "INSERT INTO `sms` (`mobile`, `otp`, `status`, `created_at`, `updated_at`) VALUES (?,?,?,?)";

    // Query Database
    const row = await connection.execute(query, [
      mobile,
      otp,
      status,
      now,
      now
    ]);

    connection.close();

    return row;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Update Into Sms
module.exports.updateSmsOtp = async (mobile, gateway, status) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      port: process.env.DB_PORT,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    // Query
    const query =
      "UPDATE `sms` SET `gateway_status`=?, `status`=?, `updated_at`=? WHERE `mobile`=?";

    // Query Database
    const row = await connection.execute(query, [gateway, status, now, mobile]);

    connection.close();

    return row;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Read Daily Sms Limit
module.exports.dailySmsLimit = async (select, mobile) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      port: process.env.DB_PORT,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    // Query
    const query = `SELECT ${select} FROM sms WHERE mobile=? AND date(created_at)=curdate()`;

    // Query Database
    const [rows, fields] = await connection.execute(query, [mobile]);

    connection.close();

    return rows;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Read Sms Record
module.exports.readSmsRecord = async (select, mobile, status) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      port: process.env.DB_PORT,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    // Query
    const query = `SELECT ${select} FROM sms WHERE mobile=? AND status=?`;

    // Query Database
    const [rows, fields] = await connection.execute(query, [mobile, status]);

    connection.close();

    return rows;
  } catch (error) {
    return Promise.reject(error);
  }
};

// // Get Sms Table Record
// module.exports.getSmsRecord = (mobile, status) => {
//   return new Promise(function(resolve, reject) {
//     mysqlObject.execute(
//       "SELECT * FROM `Sms` WHERE `mobile`=? AND `status`=?",
//       [mobile, status],
//       function(err, row) {
//         if (err) {
//           return reject(err);
//         }
//         return resolve(row);
//       }
//     );
//   });
// };

/**
 * End Database Read and Write
 */
