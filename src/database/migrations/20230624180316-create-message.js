'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Post = queryInterface.createTable('messages', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      reply_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'messages',
          key: 'id'
        },
        allowNull: true
      },
      author_uid: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'uid'
        }
      },
      partner_uid: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'uid'
        }
      },
      value: {
        type: Sequelize.TEXT
      },

      is_edited: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('messages');
  }
};
