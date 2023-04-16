'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log(Sequelize.NOW)
    const Post = queryInterface.createTable('posts', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      body: {
        type: Sequelize.JSON,
        allowNull: false,
        onDelete: 'cascade'
      },

      pet_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'pets',
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

    return Post;
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('posts');
  }
};
