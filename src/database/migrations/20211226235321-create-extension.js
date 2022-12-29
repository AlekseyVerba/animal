'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.sequelize.query('CREATE EXTENSION "uuid-ossp";')
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.sequelize.query('DROP EXTENSION "uuid-ossp";')
  }
};
