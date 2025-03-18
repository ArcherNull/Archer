/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-04-14 11:22:43
 * @LastEditTime: 2024-07-09 19:16:52
 * @Description: 公共配置文件
 */
"use strict";
const path = require("path");
const { name, version } = require("./package.json");

const SYS_CONFIG = {
  NAME: name, // 项目名称
  VERSION: version, // 项目版本号
  PORT: 3002, // 端口号
  ENV_VERSION: "v1", // v1 表示development 环境 ； v2表示 uat 环境； v3 表示production 环境
  TOKEN_PREFIX: "/api", // jwt鉴权接口前缀
  NO_TOKEN_PREFIX: "/admin", // 非jwt鉴权接口前缀
  TOKEN_SECRET_KEY: "ycVBYNk+lao*4iWl", // token生成密钥，随机字符生成器：https://miniwebtool.com/zh-cn/random-string-generator/
  SHORT_TOKEN_DEAD_TIME: "1 days", // 短token失效时间 30s  / 1 days 。 短token用于支付和一些密级操作
  LONG_TOKEN_DEAD_TIME: "1 days", // 长token失效时间 30s  / 1 days 长token用于登录操作
  TOKEN_JWT_ALGORITHM: "RS256", // HS256
  TOKEN_EXPRESS_JWT_ALGORITHM: ["HS256"], // RS256

  PAGE_SIZE: 10, // 默认每页条数
  CURRENT_PAGE: 1, // 默认第一页

  BASE_URL: "http://www.localhost", // 域名
  ASSETS_ROOT_PATH: "/public", // 静态资源根路径

  UPLOAD_FILE_STORE_ROOT_PATH: "/uploads", // 文件上传存放地址
  UPLOAD_FILE_MAX_SIZE: 1 * 1024 * 1024, // 设置上传文件大小最大限制，默认10M
  // 上传文件接受存储的后缀名列表
  UPLOAD_FILE_STORE_EXTNAME_LIST: {
    // 图片
    image: [".png", ".jpg", ".jpeg", ".gif"],
    // excel
    excel: [".xlsx", ".csv", ".xls"],
    // doc文档
    doc: [".docx"],
    // txt文件
    txt: [".txt"],
    // zip 压缩文件
    zip: [".zip"],
    // 影视
    video: [".mp4"],
    // 音频
    voice: [".mp3"],
    // ppt
    ppt: [".pptx"],
  },

  INIT_PASSWORD: "12345", // 初始化密码

  // 邮箱配置
  NODEMAILER_CONFIG: {
    QQ: {
      service: "qq", //类型qq邮箱
      port: 465, //上文获取的port
      secure: true, //上文获取的secure
      auth: {
        user: "779217162@qq.com", // 发送方的邮箱，可以选择你自己的qq邮箱
        pass: "loeerzetkfdabfhi", // 上文获取的stmp授权码
      },
    },
  },

  // 阿里云 SMS Client 短信服务
  TENCENT_CLOUD_SMS_CONFIG: {
    accessKeyId: "", // 你的keyID
    secretAccessKey: "", // 你的密钥
    signName: "", //必填:短信签名-可在短信控制台中找到
    templateCode: "", //必填:短信模板-可在短信控制台中找到，发送国际/港澳台消息时，请使用国际/港澳台短信模版
  },

  // 加密生成盐的长度
  BCRYPT_SALT_NUM: 12,

  // 默认的时间格式化
  DEFAULT_DATE_FORMAT: "YYYY-MM-DD HH:mm:ss",

  // bodyparser 配置项
  BODY_PARSER_CONFIG: {
    enableTypes: ["json", "form", "text"], // 设置解析类型，默认为[‘json’, ‘form’]
    encoding: "utf-8", // 请求编码。默认值是utf-8
    formLimit: "56kb", // 单大小上限。如果大于此限制，则返回413错误代码。默认是56kb。
    jsonLimit: "1mb", // json大小上限。默认是1mb
    textLimit: "1mb", // text大小上限。默认是1mb。
    // 支持自定义错误句柄，如果koa-bodyparser抛出错误，可以自定义响应
    onerror: function (err, ctx) {
      ctx.throw("body parse error", 422);
    },
  },

  // koa2-cors 配置项
  KOA2_CORS_CONFIG: {
    origin: function (ctx) {
      if (ctx.url === "/test") {
        // 这里可以配置不运行跨域的接口地址
        return false;
      }
      return "*";
    },
    exposeHeaders: ["WWW-Authenticate", "Server-Authorization"],
    maxAge: 5,
    credentials: true,
    allowMethods: ["GET", "POST", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
  },

  // 是否开启log4日志打印
  IS_OPEN_LOG4JS: false,

  // 验证码过期时间，单位为分钟
  VERIFY_CODE_EXPIRES_TIME: 5,
};

// 完整域名路径
const FULL_BASE_URL = `${SYS_CONFIG.BASE_URL}:${SYS_CONFIG.PORT}`;

// koa-body 配置项
const KOA_BODY_CONFIG = {
  multipart: true, // 是否多传
  formidable: {
    uploadDir: path.join(
      __dirname,
      "./",
      SYS_CONFIG.ASSETS_ROOT_PATH,
      SYS_CONFIG.UPLOAD_FILE_STORE_ROOT_PATH
    ), // 设置上传地址
    maxFileSize: SYS_CONFIG.UPLOAD_FILE_MAX_SIZE, // 设置上传文件大小最大限制，默认2M
    keepExtensions: true, // 保持原始文件的扩展名
  },
};

// swagger-ui配置
const SWAGGER_CONFIG = {
  TITLE: `${SYS_CONFIG.NAME}系统-swagger文档`,
  PORT: 5002, // swagger-ui端口号
};

// ws配置
const WS_CONFIG = {
  PORT: 3002, // 连接端口号
};

module.exports = {
  ...SYS_CONFIG,
  FULL_BASE_URL,
  KOA_BODY_CONFIG,
  SWAGGER_CONFIG,
  WS_CONFIG,
};
