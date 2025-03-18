/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-04-01 09:45:02
 * @LastEditTime: 2023-07-06 08:38:47
 * @Description: 雪花id
 */
const SnowflakeId = require("snowflake-id");

/**
 * @description: 生成特定的雪花id
 * @return {*}
 */
exports.generateSnowflakeId = () => {
  const snowflake = new SnowflakeId({
    mid: 1,
    offset: (new Date().getFullYear() - 1970) * 24 * 3600 * 365 * 1000
  });
  const snowflakeId = snowflake.generate();
  return snowflakeId;
};
