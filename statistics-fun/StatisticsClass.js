/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-04-13 17:27:53
 * @LastEditTime: 2025-03-10 15:44:00
 * @Description:
 */

// 时间格式化
function formatDate(date) {
  const formatDateStr = (n) => (n > 9 ? n : "0" + n);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const seconds = date.getSeconds();
  return `${year}-${formatDateStr(month)}-${formatDateStr(day)} ${formatDateStr(
    hour
  )}:${formatDateStr(minute)}:${formatDateStr(seconds)}`;
}

// 基类
export class BaseStatisticsClass {
  // 时间标记点列表
  timePointList = [];
  // 开始时间
  _startTime;
  // 结束时间
  _endTime;
  // 类型1首页访问,2工作台,3查单,4整车,5零担,6铁路,7订单列表页,8我的
  _type;

  constructor(type) {
    this._type = type;
    this.setStartTime();
  }

  // 设置开始时间
  setStartTime() {
    this._startTime = new Date();
  }

  // 设置结束时间，并计算持续时间
  setEndTime() {
    this._endTime = new Date();
    this._duration = this.calcDuration();
  }
  // 计算持续时间
  calcDuration() {
    return this._endTime - this._startTime;
  }

  // 添加事件标记点
  addTimePoint(reamrk) {
    this.timePointList.push({
      flag: 3,
      time: formatDate(new Date()),
      reamrk,
    });
  }
}

export class ParentStatisticsClass extends BaseStatisticsClass {
  static TYPE_LIST = {
    1: "首页",
    2: "详情",
    3: "我的",
  };
  // 客户id
  _customerId;
  // 登录账号
  _userName;
  // 客户名
  _customerName;
  // 访问来源1.网页，2.小程序
  _source;
  // 子进程统计列表
  _childList = [];
  // 回调函数，用于对公共参数重新赋值
  _callback = null;

  constructor(options) {
    super();
    this.dealProps(options);
    this.setStartTime();
    // this.startChildProcess(options.type)

    // 注册事件队列 ,使用发布订阅模式
    this.eventMap = new Map();
    this.eventMap.set("change", new Set());
  }
  // 注册事件
  on(event, handler) {
    this.eventMap.get(event).add(handler);
  }
  // 移除事件
  off(event, handler) {
    this.eventMap.get(event).delete(handler);
  }
  // 触发事件
  emit(event, data) {
    this.eventMap.get(event).forEach((h) => {
      h.call(this, data, this);
    });
  }
  // 处理入参
  dealProps(options) {
    const { customerId, userName, customerName, source = 1 } = options;
    this._customerId = customerId;
    this._userName = userName;
    this._customerName = customerName;
    this._source = source;
  }
  // 添加回调函数
  addGetCommDataCallback(callback) {
    if (typeof callback === "function") {
      this._callback = callback;
    }
  }
  // 获取当前处于执行中的进程
  get getCurrentChildProcess() {
    return this._childList.at(-1);
  }

  // 发送change的方法
  emitChangeFun(that) {
    const commData = {
      customerId: this._customerId,
      userName: this._userName,
      customerName: this._customerName,
      source: this._source,
      // 进入应用时间
      intoAppletTime: this._startTime ? formatDate(this._startTime) : undefined,
      // 离开应用时间
      leaveAppletTime: this._endTime ? formatDate(this._endTime) : undefined,
    };
    setTimeout(() => {
      // 上报第一条
      const firstItem = that._childList.shift();
      console.log("上报项=====>", firstItem);
      if (firstItem?._startTime && firstItem?._endTime) {
        commData.type = firstItem._type;
        const urlName = ParentStatisticsClass.TYPE_LIST[firstItem._type];
        commData.details = [
          {
            flag: 1, // 1 表示进入页面时间，2表示离开页面时间，3表示界面点击操作时间
            time: formatDate(firstItem._startTime),
            reamrk: `进入${urlName}`,
          },
          {
            flag: 2,
            time: formatDate(firstItem._endTime),
            reamrk: `离开${urlName}`,
          },
        ];

        commData.timePointList = firstItem.timePointList;

        // console.log('commData=====>', commData)
        this.emit("change", commData);
      }
    });
  }

  // 开始一个子进程
  startChildProcess(type) {
    console.log("开始一个子进程", type);
    const typeStr = String(type);
    const typeList = Object.keys(ParentStatisticsClass.TYPE_LIST);
    const that = this;
    if (typeList.includes(typeStr)) {
      // 相同type进程过滤
      if (this.getCurrentChildProcess?._type != type) {
        // 如果已经存在子进程了，则结束上一个进程，开启新一个进程
        if (this._childList?.length) {
          this.getCurrentChildProcess.setEndTime();
          that.emitChangeFun(that);
        }

        if (this._callback && typeof this._callback === "function") {
          const data = this._callback();
          this.dealProps(data);
        }

        setTimeout(() => {
          const childProcess = new BaseStatisticsClass(typeStr);
          this._childList.push(childProcess);
        });
      }
    } else {
      throw new Error(`参数[type]不满足【${typeList.join("/")}】`);
    }
  }

  // 界面点击事件记录
  recordPageClickEvent(eventName) {
    this.getCurrentChildProcess.addTimePoint(eventName);
  }

  // 结束所有进程
  finishAllProcess() {
    this.getCurrentChildProcess.setEndTime();
    this.setEndTime();
    this.emitChangeFun(this);
  }

  // 重置进入应用和离开应用时间
  resetAPPTime() {
    this.setStartTime();
    this._endTime = undefined;
  }
}

/**
 * @description: 单例模式，所有界面只需要用到一个实例
 * @param {*} cData
 * @return {*}
 */
export const getStatisticsInstance = (cData) => {
  const commData = typeof cData === "object" ? cData : {};
  const pStatistics = new ParentStatisticsClass(commData);

  return pStatistics;
};
