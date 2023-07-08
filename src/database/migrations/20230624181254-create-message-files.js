'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('message_file', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      id_message: {
        type: Sequelize.INTEGER,
        references: {
          model: 'messages',
          key: 'id'
        },
        onDelete: 'cascade'
      },
      type: {
        type: Sequelize.TEXT,
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      preview_value: {
        type: Sequelize.TEXT
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('message_file');
  }
};
