/*
 * @Author: Null
 * @Date: 2023-01-14 17:36:29
 * @Description: 公共方法文件
 */
const moment = require("moment");
const { DEFAULT_DATE_FORMAT } = require("../config");
const { isObject, isEmpty } = require("lodash");

/**
 * @description: 模块url生成器
 * @param {string} url url
 * @param {string} prefix 前缀
 * @return {*}
 */
exports.generateModulePrefix = function (url, prefix = "") {
  return prefix ? `${prefix}${url}` : url;
};

/**
 * @description: 必要参数校验
 * @param {*} validateObj 校验对象
 * @param {*} requiredObj 校验必穿参数
 * @return {*}
 */
exports.validateRequiredParams = function (validateObj, requiredObj) {
  const reqObj = typeof requiredObj === "object" ? requiredObj : {};
  const valObj = typeof validateObj === "object" ? validateObj : {};
  const emptyValArr = [null, undefined, "", NaN];

  const errLog = [];
  const keysArr = Object.keys(reqObj);

  if (keysArr.length) {
    keysArr.forEach((ele) => {
      if (emptyValArr.includes(valObj[ele])) {
        errLog.push(
          `必填字段为:【${ele}】; 必填字段名为:【${reqObj[ele]}】;当前值为:【${valObj[ele]}】`
        );
      }
    });
  } else {
    errLog.push(
      `函数validateRequiredParams的传参requiredObj为对象，且不能为空`
    );
    return false;
  }
  return errLog;
};

/**
 * @description: 起始时间和截至时间参数校验
 * @param {*} validateObj 校验对象
 * @param {*} requiredObj 校验必穿参数
 * @return {*}
 */
exports.validateStartTimeAndEndTIme = function (
  dateObj,
  dateFormat = DEFAULT_DATE_FORMAT
) {
  return new Promise((resolve, reject) => {
    const dateFormatArr = [
      "YYYY-MM-DD",
      "YYYY-MM-DDTHH:mm",
      "YYYY-MM-DD HH:mm",
      "YYYY-MM-DDTHH:mm:ss",
      "YYYY-MM-DD HH:mm:ss",
    ];
    if (dateFormatArr.includes(dateFormat)) {
      const startTimeName =
        dateFormat === "YYYY-MM-DD" ? "起始日期" : "起始时间";
      const endTimeName = dateFormat === "YYYY-MM-DD" ? "截至日期" : "截至时间";

      const { startTime, endTime } = dateObj;

      // 校验时间格式
      const isValidDateFun = (dStr, dStrName) => {
        const isValidDate = (dateStr) =>
          moment(dateStr, dateFormat, true).isValid();
        if (dStr) {
          if (isValidDate(dStr)) {
            return dStr;
          } else {
            reject(`${dStrName}格式不正确,不满足${dateFormat}`);
          }
        }
      };

      const startTimeVal = isValidDateFun(startTime, startTimeName);
      const endTimeVal = isValidDateFun(endTime, endTimeName);

      if (startTimeVal && endTimeVal) {
        if (moment(endTimeVal).isAfter(startTimeVal)) {
          resolve({
            startTime: startTimeVal,
            endTime: endTimeVal,
          });
        } else {
          reject(`${endTimeName}应在${startTimeName}之后`);
        }
      } else {
        resolve({
          startTime: startTimeVal,
          endTime: endTimeVal,
        });
      }
    } else {
      reject(`时间格式化参数应满足【${dateFormatArr.join("/")}】其中之一`);
    }
  });
};

/**
 * @description: 获取时间函数
 * @param {number} offset 时间偏移
 * @param {string} dateFormat 时间格式化字符串
 * @return {*}
 */
exports.getFormatTime = function (
  offset = 0,
  dateFormat = DEFAULT_DATE_FORMAT
) {
  // 时间偏移
  const offsetTime = offset * 24 * 60 * 60 * 1000;
  // 当前时间
  const calcTime = moment(new Date() + offsetTime).format(dateFormat);
  console.log("calcTime======>", calcTime);
  return calcTime;
};

/**
 * @description: 过滤对象空值
 * @param {Object} obj
 * @return {*}
 */
exports.filterObjEmptyProperty = function (obj, attrList = []) {
  if (isObject(obj) && !isEmpty(obj)) {
    const emptyValArr = ["", undefined, "undefined", "null", NaN, "NaN"];
    return Object.fromEntries(
      Object.entries(obj).filter((ele) => {
        let bool = true
        if (attrList.length) {
          bool = attrList.includes(ele[0])
        }
        return bool && !emptyValArr.includes(ele[1])
      })
    );
  }
};

/**
 * @description: 过滤对象空值
 * @param {String} ids ids , 英文逗号分隔
 * @param {String} key
 * @return {*}
 */
exports.parseSeqSqlIds = function (ids, key = "id") {
  if (ids && key) {
    const idsStr = String(ids)
    const idArr = idsStr?.split(",").filter((ele) => ele);
    const uniqueArr = Array.from(new Set([...idArr]));
    if (uniqueArr?.length) {
      return uniqueArr.map((ele) => {
        return {
          [key]: ele,
        };
      });
    } else {
      return [];
    }
  } else {
    return [];
  }
};
