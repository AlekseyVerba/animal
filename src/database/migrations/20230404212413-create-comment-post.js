'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Comment = queryInterface.createTable('comments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      user_uid: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'uid'
        },
        onDelete: 'cascade',
      },

      post_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'posts',
          key: 'id'
        },
        onDelete: 'cascade',
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull: false
      },

      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
        allowNull: false
      }

    });

    return Comment
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('comments');
  }
};
