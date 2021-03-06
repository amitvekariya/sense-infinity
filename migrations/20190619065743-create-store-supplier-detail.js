"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("store_supplier_details", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      supplier_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      store_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "partner_stores",
          key: "store_id"
        }
      },
      supplier_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      supplier_address_one: {
        type: Sequelize.STRING,
        allowNull: true
      },
      supplier_address_two: {
        type: Sequelize.STRING,
        allowNull: true
      },
      supplier_landmark: {
        type: Sequelize.STRING,
        allowNull: true
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pincode: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      supplier_mobile: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      supplier_email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      gstin: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cin: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pan: {
        type: Sequelize.STRING,
        allowNull: true
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      track_status: {
        type: Sequelize.BOOLEAN,
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
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("store_supplier_details");
  }
};
