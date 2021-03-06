'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "product_units", [{
        product_unit_name: "Kg",
        product_unit_value: "Kilograms",
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        product_unit_name: "Ltr",
        product_unit_value: "Litres",
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        product_unit_name: "M",
        product_unit_value: "Meters",
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        product_unit_name: "Pc",
        product_unit_value: "Pieces",
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }], {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("product_units", null, {});
  }
};