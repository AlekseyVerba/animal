
'use strict';

const { fn } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const User = queryInterface.createTable('users', {
      uid: {
        type: Sequelize.UUID,
        defaultValue: fn('uuid_generate_v4'),
        unique: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      nickname: {
        type: Sequelize.TEXT,
        allowNull: true,
        unique: true
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      country: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      city: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      email: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isActivate: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    });

    User.associate = models => {
      Tag.belongsToMany(models.tags, { through: 'user_tag' });
    };

    return User
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};