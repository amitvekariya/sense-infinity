"use strict";

const moment = require("moment");
const mysql = require("mysql2/promise");
const dotEnv = require("dotenv");

module.exports = (sequelize, DataTypes) => {
  var sense_offer = sequelize.define(
    "sense_offer",
    {
      offer_name: DataTypes.STRING,
      status: DataTypes.BOOLEAN
    },
    {}
  );
  sense_offer.associate = function(models) {
    // associations can be defined here
  };
  return sense_offer;
};

// Current Date and Time
const now = moment()
  .tz("Asia/Kolkata")
  .format("YYYY-MM-DD HH-m-ss");

/**
 * Start Database Read and Write
 */

// Read Sense Offer Record
module.exports.readSenseOffer = async (select, name, status) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      port: process.env.DB_PORT,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    // Query
    const query = `SELECT ${select} FROM sense_offers WHERE offer_name = ? AND status = ?`;

    // Query Database
    const [rows, fields] = await connection.execute(query, [status]);

    connection.close();

    return rows;
  } catch (error) {
    return Promise.reject(error);
  }
};
/**
 * End Database Read and Write
 */
