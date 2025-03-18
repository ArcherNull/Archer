/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-10-11 14:31:09
 * @LastEditTime: 2024-05-28 11:57:56
 * @Description: 表创建命令
 *
 * 两部分来操作，第一部分数据库创建，第二部分是数据库中的表创建
 *
 * 我们通过 ENV_VERSION 变量来区分环境，v1 表示development 环境 ； v2表示 uat 环境； v3 表示production 环境，默认v1
 *
 * 命令字符串构成为： 脚手架命令 npx sequelize-cli  /  命令主体  / 环境命令
 *
 */
const { isEmpty, isObject } = require("lodash");
const { ENV_VERSION } = require("../../config");
const TABLES = require("./model");

/**
 * @description: 生成命令字符串
 * @param {string} commandStr
 * @return {*}
 */
function generateCommandStr(commandStr) {
  if (commandStr) {
    const envObj = {
      v1: "development",
      v2: "uat",
      v3: "production",
    };
    return `npx sequelize-cli ${commandStr} --env=${
      envObj[ENV_VERSION] || "development"
    }`;
  } else {
    throw new Error("generateCommandStr入参commandStr是必传项");
  }
}

/**
 * @description: 数据库创建
 * @return {*}
 */
function generateCreateDataabaseCommand() {
  return {
    comment: "数据库创建",
    create: generateCommandStr("db:create"),
    drop: generateCommandStr("db:drop"),
  };
}

/**
 * @description: 表模型创建
 * @return {*}
 */
function generateTableCommand() {
  const getTablesMainCom = (item) => {
    const { name, attributes } = item;
    if (name) {
      if (isObject(attributes) && !isEmpty(attributes)) {
        const attributesStr = Object.entries(attributes)
          .map((ele) => `${ele[0]}:${ele[1]}`)
          .join(",");
        return `--name ${name} --attributes ${attributesStr}`;
      } else {
        throw new Error("表名字段是比传参数,且不为空对象");
      }
    } else {
      throw new Error("表名称是比传参数");
    }
  };
  const tableObj = Object.fromEntries(
    Object.entries(TABLES).map((ele) => {
      const [key, value] = ele;
      const table = {
        comment: value.comment,
        create: generateCommandStr(
          `model:generate ${getTablesMainCom(value)} --force`
        ),
        drop: null,
      };
      return [key, table];
    })
  );
  return tableObj;
}

// 校验数据库和表是否符合格式


/**
 * @description: 生成数据库和表命令
 * @return {*}
 */
exports.generateDatabaseAndTablesCom = function () {
  const database = generateCreateDataabaseCommand();
  const tables = generateTableCommand();

  const commandObj = {
    database,
    tables,
  };
  console.log("commandObj", commandObj);
  return commandObj;
};

/**
 * @description: 生成迁移文件
 * @return {*}
 */
exports.generateMigrateCom = function () {
  return generateCommandStr("db:migrate");
};
