'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('posts', 'user_uid', {
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'uid',
      },
      allowNull: true,
      onDelete: 'cascade',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('posts', 'user_uid');
  },
};
