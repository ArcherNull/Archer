/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-08 15:03:41
 * @LastEditTime: 2024-07-09 18:57:48
 * @Description:
 */
const log4js = require("log4js");
const path = require("path");
const { isEmpty } = require("lodash");
const { IS_OPEN_LOG4JS } = require("../config");
// 配置
const LOG4JS_CONFIG = {
  appenders: {
    // 控制台输出
    console: { type: "console" },
    app: {
      type: "dateFile", // 文件类型
      filename: path.join(__dirname, "/record/app", "./app"),
      encoding: "utf-8", // 编码格式
      maxLogSize: 1024 * 500, //一个文件的大小，超出后会自动新生成一个文件
      backups: 2, // 备份的文件数量
      // 配置 layout，此处使用自定义模式 pattern
      layout: {
        type: "pattern",
        // 配置模式
        pattern:
          "[date:%d] [level:%p] [category:%c] [host:%h] [pid:%z] [data:%m]",
      },
      pattern: "-yyyy-MM-dd.log",
      keepFileExt: true, // 保持文件后缀名
      alwaysIncludePattern: true,
    },

    // 错误日志文件
    errorFile: {
      type: "dateFile",
      filename: path.join(__dirname, "/record/error", "./error"),
      maxLogSize: 1024 * 500, // 一个文件的大小，超出后会自动新生成一个文件
      backups: 2, // 备份的文件数量
      layout: {
        type: "pattern",
        // 配置模式
        pattern:
          "[date:%d] [level:%p] [category:%c] [host:%h] [pid:%z] [data:%m]",
      },
      pattern: "_yyyy-MM-dd.log",
      alwaysIncludePattern: true,
    },
  },
  categories: {
    // 默认日志，输出debug 及以上级别的日志
    default: {
      appenders: [
        "app",
        "console", // 不向控制台输出
      ],
      level: "debug",
    },
    // 错误日志，输出error 及以上级别的日志
    error: { appenders: ["errorFile"], level: "error" },
  },
  replaceConsole: true, // 替换console.log
};

log4js.configure(LOG4JS_CONFIG);

// 获取默认日志
const defaultLogger = log4js.getLogger();
// 获取错误级别日志
const errorLogger = log4js.getLogger("error");

const getLoggerProxy = () => {
  const loggerProxy = {};
  const levelsArr = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL"];
  const levels = log4js.levels.levels.filter(
    (lev) => levelsArr.indexOf(lev.levelStr) !== -1
  );
  levels.forEach((level) => {
    const curLevel = level.levelStr.toLowerCase();
    loggerProxy[curLevel] = (...params) => {
      if (IS_OPEN_LOG4JS) {
        defaultLogger[curLevel](...params);
        errorLogger[curLevel](...params);
      } else {
        console.info(...params);
      }
    };
  });

  return loggerProxy;
};

// 日志代理，同时调用默认日志和错误日志
const loggerProxy = getLoggerProxy();


// 用于http请求来回打印中间价
const httpLoggerMiddleware = async (ctx, next) => {
  const getParams = (ctx) => {
    const { query, body } = ctx.request;
    if (isEmpty(query)) {
      return isEmpty(body) ? "无入参" : JSON.stringify(body);
    } else {
      return JSON.stringify(query);
    }
  };

  loggerProxy.info(
    `请求开始：[${ctx.method}-${ctx.url}]；请求参数：${getParams(ctx)}`
  );

  const start = new Date();
  // 对于任何请求，app将调用该异步函数处理请求
  await next();
  const ms = new Date() - start;
  loggerProxy.info(
    `请求结束[${ms}ms]：[${ctx.method}-${ctx.url}-${
      ctx?.header?.Authorization || ""
    }]；请求参数：${getParams(ctx)}；请求响应参数：${JSON.stringify(ctx.body)}`
  );
};

module.exports = {
  httpLoggerMiddleware,
  loggerProxy,
};
