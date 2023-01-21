'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_pet_followers', {
      follower_uid: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'uid'
        },
        onDelete: 'cascade'
      },
      pet_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'pets',
          key: 'id'
        },
        onDelete: 'cascade'
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_pet_followers');
  }
};
