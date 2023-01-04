'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('tags', [
      {
        name: 'Dogs',
      },
      {
        name: 'Cats',
      },
      {
        name: 'Monkeys'
      }
  ]).then(data => {
      console.log(data)
      return queryInterface.bulkInsert('tags', [
        {
          name: 'Affenpinscher',
          parent_id: 1
        },
        {
          name: 'Afghan Hound',
          parent_id: 1
        },
        {
          name: 'Airedale Terrier',
          parent_id: 1
        },
        {
          name: 'Akita',
          parent_id: 1
        },
        {
          name: 'Alaskan Klee Kai',
          parent_id: 1
        },
        {
          name: 'American Bulldog',
          parent_id: 1
        },
        {
          name: 'American Foxhound',
          parent_id: 1
        },   
    
    
        {
          name: 'Abyssinian Cat',
          parent_id: 2,
        },
        {
          name: 'American Bobtail Cat Breed',
          parent_id: 2,
        },
        {
          name: 'Bengal Cat',
          parent_id: 2,
        },
        {
          name: 'Bombay Cat',
          parent_id: 2,
        },
        {
          name: 'Burmese Cat',
          parent_id: 2,
        },
        {
          name: 'Chartreux Cat Breed',
          parent_id: 2,
        },
    
    
        {
          name: 'Macaque',
          parent_id: 3,
        },
        {
          name: 'Chimpanzee',
          parent_id: 3,
        },
        {
          name: 'Tamarin',
          parent_id: 3,
        },
        {
          name: 'Capuchin',
          parent_id: 3,
        },
        {
          name: 'Marmoset',
          parent_id: 3,
        },
        {
          name: 'Spider Monkey',
          parent_id: 3,
        },
    
        
      ])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('tags', null, {});
  }
};


