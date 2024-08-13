/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-27 15:51:25
 * @LastEditTime: 2023-08-01 16:12:26
 * @Description: 定时任务方法封装
 */
const schedule = require("node-schedule");

/* 
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTioNAL)

每分钟的第30秒触发： '30 * * * * *'

每小时的1分30秒触发 ：'30 1 * * * *'

每天的凌晨1点1分30秒触发 ：'30 1 1 * * *'

每月的1日1点1分30秒触发 ：'30 1 1 1 * *'

2016年的1月1日1点1分30秒触发 ：'30 1 1 1 2016 *'

每周1的1点1分30秒触发 ：'30 1 1 * * 1'

*/

class IntervalSchedule {
  constructor(props) {
    if (props) {
      const { unitName, maintainTime, lastAlarm } = props;
      this.unitName = unitName; // 任务名字
      this.maintainTime = maintainTime; // 定时时间
      this.lastAlarm = lastAlarm || ""; // 上一次定时任务名字
    }

    return this;
  }

  // 生成新的定时任务
  create(callback) {
    // 终止之前的定时任务
    if (this.lastAlarm !== "") {
      this.delete(this.lastAlarm);
    }
    if (
      this.unitName &&
      this.maintainTime &&
      callback &&
      typeof callback === "function"
    ) {
      schedule.scheduleJob(
        `${this.unitName}`,
        `${this.maintainTime}`,
        callback
      );
    }

    return this;
  }

  // 删除定时任务
  delete() {
    if (schedule.scheduledJobs[this.unitName]) {
      schedule.scheduledJobs[this.unitName].cancel();
      return true;
    }
    return false;
  }

  // 删除所有定时任务
  deleteAll() {
    if (schedule.scheduledJobs) {
     const taskNameArr = Object.keys(schedule.scheduledJobs);
      if (taskNameArr.length) {
        taskNameArr.forEach((ele) => {
          schedule.scheduledJobs[ele].cancel();
        });
        return true;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  // 找到一个定时任务
  findOne(name) {
    if (schedule.scheduledJobs[name]) {
      return schedule.scheduledJobs[name];
    } else {
      throw new Error("未找到任务名");
    }
  }

  // 查看所有的定时任务
  findAll() {
    return schedule.scheduledJobs;
  }

  // schedule实例
  static schedule() {
    return schedule;
  }
}

exports.IntervalSchedule = IntervalSchedule;
