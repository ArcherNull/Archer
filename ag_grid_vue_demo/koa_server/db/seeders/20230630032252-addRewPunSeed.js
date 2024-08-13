/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-30 11:22:52
 * @LastEditTime: 2023-06-30 11:29:25
 * @Description: 
 */
'use strict';

const { rewardPunishmentMockSeed } = require("../mock/rewardPunishmentMockSeed");

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
     const insertData = rewardPunishmentMockSeed();

     console.log("insertData", insertData);
 
     await queryInterface.bulkInsert("reward_punishments", [...insertData.data], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     await queryInterface.bulkDelete("reward_punishments", null, {});

  }
};
