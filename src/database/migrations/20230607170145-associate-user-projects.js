'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_post_favorite', {
      user_uid: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'uid'
        },
        onDelete: 'cascade'
      },
      post_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'posts',
          key: 'id'
        },
        onDelete: 'cascade'
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull: false
      },
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_post_favorite');
  }
};
