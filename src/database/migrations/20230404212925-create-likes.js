'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Like = queryInterface.createTable('likes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      value: {
        type: Sequelize.TEXT
      },

      comment_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'comments',
          key: 'id'
        },
        allowNull: true,
        onDelete: 'cascade',
      },

      post_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'posts',
          key: 'id'
        },
        allowNull: true,
        onDelete: 'cascade',
      },

      user_uid: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'uid'
        },
        onDelete: 'cascade',
      },

    })
    .then(() => queryInterface.addConstraint('likes', {
      type: 'FOREIGN KEY',
      name: 'FK_likes_comments', // useful if using queryInterface.removeConstraint
      fields: ['comment_id'],
      references: {
        table: 'comments',
        field: 'id',
      },
      onDelete: 'no action',
      onUpdate: 'no action',
    }))

    .then(() => queryInterface.addConstraint('likes', {
      type: 'FOREIGN KEY',
      name: 'FK_likes_posts', // useful if using queryInterface.removeConstraint
      fields: ['post_id'],
      references: {
        table: 'posts',
        field: 'id',
      },
      onDelete: 'no action',
      onUpdate: 'no action',
    }))

    return Like
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('likes');
  }
};
