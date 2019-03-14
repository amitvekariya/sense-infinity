'use strict';
module.exports = (sequelize, DataTypes) => {
  var warehouse_information_list = sequelize.define('warehouse_information_list', {
    warehouse_information_id: DataTypes.INTEGER,
    partner_id: DataTypes.INTEGER,
    business_name: DataTypes.STRING,
    address_one: DataTypes.STRING,
    address_two: DataTypes.STRING,
    landmark: DataTypes.STRING,
    city_id: DataTypes.INTEGER,
    locality_id: DataTypes.INTEGER,
    gstin: DataTypes.STRING,
    cin: DataTypes.STRING,
    pan: DataTypes.STRING,
    mobile: DataTypes.STRING,
    email: DataTypes.STRING,
    status: DataTypes.BOOLEAN
  }, {});
  warehouse_information_list.associate = function(models) {
    // associations can be defined here
  };
  return warehouse_information_list;
};