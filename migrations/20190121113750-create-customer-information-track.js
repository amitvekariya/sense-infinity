"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("customer_information_tracks", {
      customer_information_track_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
        type: Sequelize.BIGINT
      },
      country_code: {
        type: Sequelize.STRING
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
      partner_id: {
        type: Sequelize.INTEGER
      },
      store_id: {
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
      gateway: {
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
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: 1
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
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("customer_information_tracks");
  }
};
