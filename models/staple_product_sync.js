'use strict';

// Import Package
const moment = require("moment-timezone");

// Import Config
const constants = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
  var stapleProductSync = sequelize.define('staple_product_sync', {
    attributes: DataTypes.JSON
  }, {});
  stapleProductSync.associate = function(models) {
    // associations can be defined here
  };
  return stapleProductSync;
};


// Current Date and Time
const now = moment()
  .tz("Asia/Kolkata")
  .format("YYYY-MM-DD HH-m-ss");


/**
 * Start Database Read and Write
 */


// Read Staple Product Sync Record
module.exports.readProductSync = async(select, sorting) => {
  try {

    // Get Pool Object
    const pool = constants.createMysqlConnection();

    // Create Connection
    const connection = await pool.getConnection();

    // Query
    const query = `SELECT ${select} FROM staple_product_syncs ORDER BY sync_id ${sorting} LIMIT 1`;

    // Query Database
    const [rows, fields] = await connection.query(query, []);

    connection.release();

    return rows;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Read Staple Product By Sync Id Record
module.exports.readProductBySyncId = async(select, syncId) => {
  try {

    // Get Pool Object
    const pool = constants.createMysqlConnection();

    // Create Connection
    const connection = await pool.getConnection();

    // Query
    const query = `SELECT ${select} FROM staple_product_syncs WHERE sync_id = ? LIMIT 1`;

    // Query Database
    const [rows, fields] = await connection.query(query, [syncId]);

    connection.release();

    return rows;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Keep Partner Product Sync Record
module.exports.keepProductSync = async(attribute) => {
  try {

    // Get Pool Object
    const pool = constants.createMysqlConnection();

    // Create Connection
    const connection = await pool.getConnection();

    // Query
    const query =
      "INSERT INTO `staple_product_syncs` (`attributes`, `created_at`, `updated_at`) VALUES (?,?,?)";

    // Query Database
    const row = await connection.query(query, [
      attribute,
      now,
      now
    ]);

    connection.release();

    return row;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Update Attributes Partner Product Sync Record
module.exports.updateAttributesSync = async(
  attributes, id
) => {
  try {

    // Get Pool Object
    const pool = constants.createMysqlConnection();

    // Create Connection
    const connection = await pool.getConnection();

    // Query
    const query =
      "UPDATE `staple_product_syncs` SET `attributes` = ?, `updated_at` = ? WHERE `sync_id` = ?";

    // Query Database
    const row = await connection.query(query, [
      attributes,
      now,
      id
    ]);

    connection.release();

    return row;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * End Database Read and Write
 */