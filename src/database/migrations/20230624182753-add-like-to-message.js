'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'likes',
      'message_id',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'messages',
          key: 'id'
        },
        allowNull: true,
        onDelete: 'cascade',
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'likes',
      'message_id'
    );
  }
};
