"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("reward_question_responses", {
      question_response_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reward_question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "customer_reward_questions",
          key: "reward_question_id"
        }
      },
      reward_option_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      customer_information_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "customer_information_data",
          key: "customer_information_id"
        }
      },
      question_response: {
        type: Sequelize.TEXT("long"),
        allowNull: true
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
    return queryInterface.dropTable("reward_question_responses");
  }
};
