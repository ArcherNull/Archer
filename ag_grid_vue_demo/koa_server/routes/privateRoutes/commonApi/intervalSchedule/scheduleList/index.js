/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-27 16:35:06
 * @LastEditTime: 2023-08-02 16:16:13
 * @Description: 
 */
const { isEmpty } = require("lodash");
const { Op } = require("sequelize");
const models = require("../../../../../db/models");
const {
  IntervalSchedule,
} = require("../../../../../middlewares/intervalSchedule");
const { SuccessModel, ErrorModel } = require("../../../../../exceptions/index");
const { sendRemindEmail } = require("../../../../../middlewares/nodemailer.js");
const { loggerProxy } = require("../../../../../logs/index");
const { isMail } = require("../../../../../lib/validate");


// 清理日志
exports.clearErrorLog = (ctx) => {
  const unitName = "清理错误日志";
  const maintainTime = "30 1 1 * * *";
  // 定时任务
  const scheduleTask = new IntervalSchedule({
    unitName,
    maintainTime,
    last_alarm: `${unitName} ${maintainTime}`,
  }).create(() => {
    // 写入你自己想在定时任务触发的时候，想要执行的函数
    loggerProxy.trace("清理错误日志进行中....");
  });

  const findTask = scheduleTask.findOne(unitName);

  if (findTask) {
    ctx.body = new SuccessModel("清理错误日志定时任务已经开启");
  } else {
    ctx.body = new ErrorModel("清理错误日志定时任务开启失败");
  }
};

// 邮件提醒
exports.emailRemind = (ctx) => {
  const bodyData = ctx.request.body;
  const { email, content, userId } = bodyData;

  const errLog = [];
  const emailVal = isMail(email);
  emailVal !== true && errLog.push(emailVal);

  !content && errLog.push(`邮箱提醒内容不能为空`);

  !userId && errLog.push(`邮箱提醒用户id不能为空`);

  if (!errLog.length) {
    console.log("邮件提醒");
    const unitName = "邮件提醒";
    const maintainTime = "0 1 * * * *";
    // 定时任务
    const scheduleTask = new IntervalSchedule({
      unitName,
      maintainTime,
      last_alarm: `${unitName} ${maintainTime}`,
    }).create(async () => {
      // 写入你自己想在定时任务触发的时候，想要执行的函数
      loggerProxy.trace("邮件提醒进行中....");
      const isSendSuccess = await sendRemindEmail(email, content, userId);
      const paramsJsonStr = JSON.stringify({ email, content, userId });
      if (isSendSuccess) {
        loggerProxy.trace(`邮件提醒发送成功，发送参数为: ${paramsJsonStr}`);
      } else {
        loggerProxy.error(`邮件提醒发送失败，发送参数为: ${paramsJsonStr}`);
      }
    });

    const findTask = scheduleTask.findOne(unitName);
    if (findTask) {
      ctx.body = new SuccessModel("邮件提醒定时任务已经开启");
    } else {
      ctx.body = new ErrorModel("邮件提醒定时任务开启失败");
    }
  } else {
    ctx.body = new ErrorModel(errLog[0] || "参数错误");
  }
};

// 查看所有定时任务
exports.findAllIntervalTask = (ctx) => {
  const interValTask = new IntervalSchedule();
  const findAllInterValTask = interValTask.findAll();
  let taskList = [];
  if (!isEmpty(findAllInterValTask)) {
    taskList = Object.keys(findAllInterValTask);
  }
  ctx.body = new SuccessModel(taskList);
};

// 清空所有定时任务
exports.deleteAllIntervalTask = (ctx) => {
  const interValTask = new IntervalSchedule();
  // 清除所有定时任务
  interValTask.deleteAll();

  const findAllInterValTask = interValTask.findAll();
  let taskList = [];
  if (!isEmpty(findAllInterValTask)) {
    taskList = Object.keys(findAllInterValTask);
  }
  if (!taskList.length) {
    ctx.body = new SuccessModel([], "所有定时任务已经成功清除");
  } else {
    ctx.body = new ErrorModel('所有定时任务清除失败');
  }
};

// 清除过期的信息码
exports.clearVerifyCode = (ctx)=>{
  const unitName = "清理info_codes表中验证码";
  const maintainTime = "30 1 1 * * *"

  // 定时任务, 清除重复的定时任务
  new IntervalSchedule({
    unitName,
    maintainTime,
    lastAlarm: `${unitName} ${maintainTime}`
  }).create(async () => {
    // 写入你自己想在定时任务触发的时候，想要执行的函数
    loggerProxy.trace(`定时任务【${unitName}】进行中....`);

    const deadline = moment().subtract(1, "day")
    // 清除失效的验证码
    const delCount = await models.info_code.destroy({
      where: {
        icExpiresTime: {
          [Op.lt]: deadline
        },
      },
    });

    loggerProxy.trace(`定时任务【${unitName}】已经成功清除【${delCount}】条数据`);

  });
  ctx.body = new SuccessModel(codeList);
}
