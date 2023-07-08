'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE messages
      ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE messages
      DROP COLUMN is_read;
    `)
  }
};
