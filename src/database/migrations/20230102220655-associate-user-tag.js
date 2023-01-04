'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_tag', {
      user_uid: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'uid'
        },
        onDelete: 'cascade'
      },
      tag_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'tags',
          key: 'id'
        },
        onDelete: 'cascade'
      }
    }).then(() => {
      return queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION add_user_to_parent_label() RETURNS trigger AS $$
          DECLARE
            parent_id_current_tag INTEGER;
            user_uid_with_parent_tag TEXT;
          BEGIN
            parent_id_current_tag := (SELECT parent_id FROM tags WHERE id = NEW.tag_id );
            
            IF parent_id_current_tag IS NOT NULL THEN
              user_uid_with_parent_tag := (SELECT user_uid FROM user_tag WHERE user_uid = NEW.user_uid AND tag_id = parent_id_current_tag );
              
              IF user_uid_with_parent_tag IS NULL THEN
                INSERT INTO user_tag VALUES(
                  NEW.user_uid,
                  parent_id_current_tag
                );
              END IF;
              
            END IF;
            
            RETURN NEW;
          END
        $$ LANGUAGE plpgsql;
      `).then(() => {
        return queryInterface.sequelize.query(`
          CREATE TRIGGER check_parent_label BEFORE INSERT ON user_tag
            FOR EACH ROW EXECUTE PROCEDURE add_user_to_parent_label();
        `)
      })
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      DROP TRIGGER check_parent_label ON user_tag
    `).then(() => {
      return queryInterface.dropTable('user_tag').then((data) => {
        return queryInterface.sequelize.query(`
          DROP FUNCTION add_user_to_parent_label
        `)
      })
    })
  }
};
