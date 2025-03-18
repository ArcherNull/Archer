/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-10-11 11:44:48
 * @LastEditTime: 2024-05-29 10:18:34
 * @Description: 数据库建立命令脚本
 */
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { generateDatabaseAndTablesCom } = require("./command");
const util = require("util");
const execPromise = util.promisify(exec);

// 创建数据库，并创建表
function createDatabaseAndTables() {
  const commandObj = generateDatabaseAndTablesCom();

  console.log("commandObj", commandObj);

  const { database, tables } = commandObj;

  // console.log('tables=====>',tables)
  const cPath = path.join(__dirname, "/command.json");
  fs.writeFileSync(cPath, JSON.stringify(commandObj));

  // createDatabase(database)
  //   .then((res) => {
  //     return createTables(tables);
  //   })
  //   .catch((err) => {
  //     throw new Error(err);
  //   });
}

// 创建数据库
function createDatabase(database) {
  return execPromise(database.create);
}

// 创建表
async function createTables(tables) {
  let index = 0;
  const commands = Object.values(tables).map((ele) => ele.create);

  try {
    // 表模型文件创建
    for (let i = 0; i < commands.length; i++) {
      index = i;
      const command = commands[i];
      const res = await execPromise(command);
      console.log(
        "exec command success",
        index,
        "[",
        commands[index],
        "]",
        "\n    value:",
        res
      );
    }
  } catch (error) {
    console.error(
      "exec command fail at:",
      index,
      "[",
      commands[index],
      "]",
      "\n    error:",
      error
    );
  }
}

console.log("createDatabaseAndTables", createDatabaseAndTables());
