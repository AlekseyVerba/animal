'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_user_followers', {
      follower_uid: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'uid'
        },
        onDelete: 'cascade'
      },
      user_uid: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'uid'
        },
        onDelete: 'cascade'
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_user_followers');
  }
};
