'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Tag = queryInterface.createTable('tags', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.TEXT,
        unique: true,
        allowNull: false,
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tags',
          key: 'id'
        },
        onDelete: 'cascade'
      },

    });


    Tag.associate = models => {
      Tag.belongsToMany(models.users, { through: 'user_tag' });
      Tag.belongsTo(models.tags)
      Tag.hasMany(models.tags)
    };

    return Tag;
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('tags');
  }
};
