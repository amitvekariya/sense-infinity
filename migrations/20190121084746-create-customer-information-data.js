"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("customer_information_data", {
        customer_information_id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER.UNSIGNED
        },
        first_name: {
          type: Sequelize.STRING,
          allowNull: true
        },
        last_name: {
          type: Sequelize.STRING,
          allowNull: true
        },
        email: {
          type: Sequelize.STRING,
          allowNull: true
        },
        mobile: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        country_code: {
          type: Sequelize.STRING,
          allowNull: false
        },
        dob: {
          type: Sequelize.STRING,
          allowNull: true
        },
        gender_id: {
          type: Sequelize.INTEGER
        },
        city_id: {
          type: Sequelize.INTEGER
        },
        locality_id: {
          type: Sequelize.INTEGER
        },
        address_one: {
          type: Sequelize.STRING,
          allowNull: true
        },
        address_two: {
          type: Sequelize.STRING,
          allowNull: true
        },
        landmark: {
          type: Sequelize.STRING,
          allowNull: true
        },
        married: {
          type: Sequelize.BOOLEAN,
          defaultValue: 0
        },
        spouse_name: {
          type: Sequelize.STRING,
          allowNull: true
        },
        anniversary_date: {
          type: Sequelize.STRING,
          allowNull: true
        },
        reward_point: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        status: {
          type: Sequelize.BOOLEAN,
          defaultValue: 0
        },
        createdAt: {
          field: "created_at",
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          field: "updated_at",
          allowNull: false,
          type: Sequelize.DATE
        }
      })

      .then(function() {
        return queryInterface.sequelize.query(
          "ALTER TABLE `customer_information_data` ADD UNIQUE `unique_index`(`mobile`,`country_code`, `status`)"
        );
      });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("customer_information_data");
  }
};
