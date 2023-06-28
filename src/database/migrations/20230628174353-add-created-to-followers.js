'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE user_user_followers
      ADD COLUMN created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE user_pet_followers
      ADD COLUMN created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE user_user_followers
      DROP COLUMN created;
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE user_pet_followers
      DROP COLUMN created;
    `)
  }
};
