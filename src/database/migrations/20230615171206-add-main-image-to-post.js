'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.sequelize.query(`
      ALTER TABLE posts
      ADD COLUMN main_image TEXT
    `)
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.sequelize.query(`
      ALTER TABLE posts
      DROP COLUMN main_image;
    `)
  }
};
