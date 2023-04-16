'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('post_tag', {
      post_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'posts',
          key: 'id'
        },
        onDelete: 'cascade'
      },
      tag_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'tags',
          key: 'id'
        },
        onDelete: 'cascade'
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('post_tag');
  }
};
