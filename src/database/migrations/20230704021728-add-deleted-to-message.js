'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE messages
      ADD COLUMN deleted_author TIMESTAMP WITH TIME ZONE;

      ALTER TABLE messages
      ADD COLUMN deleted_partner TIMESTAMP WITH TIME ZONE;
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE messages
      DROP COLUMN deleted_author;

      ALTER TABLE messages
      DROP COLUMN deleted_partner;
    `)
  }
};
