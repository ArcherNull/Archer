'use strict';

const { commentMockSeed } = require("../mock/commentMockSeed");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
     const insertData = commentMockSeed();

     console.log("insertData", insertData);
 
     await queryInterface.bulkInsert("comments", [...insertData.data], {});
  
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     await queryInterface.bulkDelete("comments", null, {});

  }
};
