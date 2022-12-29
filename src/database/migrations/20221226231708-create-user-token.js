'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_token', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      token: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      type: {
        type: Sequelize.TEXT
      },

      expire: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      userUid: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'uid'
        },
        onDelete: 'cascade',
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_token');
  }
};
