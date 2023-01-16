'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_avatar', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      small: {
        type: Sequelize.TEXT,
      },
      middle: {
        type: Sequelize.TEXT,
      },
      large: {
        type: Sequelize.TEXT,
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
    return queryInterface.dropTable('user_avatar');
  }
};
