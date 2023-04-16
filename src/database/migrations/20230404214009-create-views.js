'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const PostView = queryInterface.createTable('post_views', {
      post_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'posts',
          key: 'id'
        },
        allowNull: true,
        onDelete: 'cascade',
      },

      user_uid: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'uid'
        },
        onDelete: 'cascade',
      }
    });

    return PostView
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('post_views');
  }
};
