
'use strict';

const { fn } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Pet = queryInterface.createTable('pets', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tags',
          key: 'id'
        },
      },
      breed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tags',
          key: 'id'
        },
      },
      date_of_birthday: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      user_uid: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'uid'
        },
      }
    }).then(data => {
      return queryInterface.addConstraint('pets', {
        fields: ['user_uid', 'name'],
        type: 'unique',
        name: 'user_uid_name_unique'
      });
    })



    return Pet
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('pets');
  }
};