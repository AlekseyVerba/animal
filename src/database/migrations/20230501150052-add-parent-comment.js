'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const update = queryInterface.sequelize.query(`
      ALTER TABLE comments
      ADD COLUMN parent_id INTEGER,
      ADD COLUMN reply_uid UUID;
    `).then(() => queryInterface.addConstraint('comments', {
      type: 'FOREIGN KEY',
      name: 'FK_comments_reply', // useful if using queryInterface.removeConstraint
      fields: ['reply_uid'],
      references: {
        table: 'users',
        field: 'uid',
      },
      onDelete: 'no action',
      onUpdate: 'no action',
    })).then(() => queryInterface.addConstraint('comments', {
      type: 'FOREIGN KEY',
      name: 'FK_comments_parent', // useful if using queryInterface.removeConstraint
      fields: ['parent_id'],
      references: {
        table: 'comments',
        field: 'id',
      },
      onDelete: 'cascade',
      onUpdate: 'no action',
    }))

    return update
  },

  down: async (queryInterface, Sequelize) => {

    const update = queryInterface.removeConstraint('comments', 'FK_comments_reply')
    .then(() => queryInterface.removeConstraint('comments', 'FK_comments_parent'))
    .then(() => queryInterface.sequelize.query(`
    ALTER TABLE comments
    DROP COLUMN parent_id,
    DROP COLUMN reply_uid;
  `))

    return update
  }
};
