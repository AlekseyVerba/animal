'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('pet_avatar', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      small: {
        type: Sequelize.TEXT,
      },
      middle: {
        type: Sequelize.TEXT,
      },
      large: {
        type: Sequelize.TEXT,
      },
      default_avatar: {
        type: Sequelize.TEXT,
      },
      pet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pets',
          key: 'id'
        },
        onDelete: 'cascade',
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('pet_avatar');
  }
};
