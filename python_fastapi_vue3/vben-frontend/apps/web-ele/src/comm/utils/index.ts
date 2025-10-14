/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-15 10:59:53
 * @LastEditTime: 2025-06-10 14:08:11
 * @Description:
 */
import type { MessageBoxData, MessageProps, NotificationProps } from 'element-plus';

import type { FieldNamesProps } from '#/components/ProTable/interface';

import dayjs from 'dayjs';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import { cloneDeep, isArray, isEmpty, isFunction, isObject, uniq } from 'lodash-es';

import { convertNumber, numberRoundUp } from '#/comm/math/index';

import { renderMoneyCell } from './render';
// 时间格式化
const DEFAULT_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

type ObjectType = {
  [key: string]: any;
};

/**
 * @description: 元素是否存在数组内
 * @param {T} element
 * @param {T} array
 * @return {*}
 */
export function isInArray<T>(element: T, array: T[]): boolean {
  return array.includes(element);
}

/**
 * @description 获取localStorage
 * @param {string} key Storage名称
 * @returns {string} 字符串
 */
export function localGet(key: string) {
  const value = window.localStorage.getItem(key);
  try {
    return JSON.parse(window.localStorage.getItem(key) as string);
  } catch {
    return value;
  }
}

/**
 * @description 存储localStorage
 * @param {string} key Storage名称
 * @param {*} value Storage值
 * @returns {void} 字符串
 */
export function localSet(key: string, value: any) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * @description 清除localStorage
 * @param {string} key Storage名称
 * @returns {void} 字符串
 */
export function localRemove(key: string) {
  window.localStorage.removeItem(key);
}

/**
 * @description 清除所有localStorage
 * @returns {void} 字符串
 */
export function localClear() {
  window.localStorage.clear();
}

/**
 * @description 判断数据类型
 * @param {*} val 需要判断类型的数据
 * @returns {string} 字符串
 */
export function isType(val: any) {
  if (val === null) return 'null';
  return typeof val === 'object'
    ? Object.prototype.toString.call(val).slice(8, -1).toLocaleLowerCase()
    : typeof val;
}

/**
 * @description 生成唯一 uuid
 * @returns {string} 字符串
 */
export function generateUUID() {
  let uuid = '';
  for (let i = 0; i < 32; i++) {
    const random = Math.trunc(Math.random() * 16);
    if (i === 8 || i === 12 || i === 16 || i === 20) uuid += '-';

    uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16);
  }
  return uuid;
}

/**
 * 判断两个对象是否相同
 * @param {object} a 要比较的对象一
 * @param {object} b 要比较的对象二
 * @returns {boolean} 相同返回 true，反之 false
 */
export function isObjectValueEqual(a: { [key: string]: any }, b: { [key: string]: any }) {
  if (!a || !b) return false;
  const aProps = Object.getOwnPropertyNames(a);
  const bProps = Object.getOwnPropertyNames(b);
  if (aProps.length !== bProps.length) return false;
  for (const propName of aProps) {
    const propA = a[propName];
    const propB = b[propName];

    if (!b.hasOwnProperty(propName)) return false;
    if (propA instanceof Object) {
      if (!isObjectValueEqual(propA, propB)) return false;
    } else if (propA !== propB) {
      return false;
    }
  }
  return true;
}

/**
 * @description 生成随机数
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns {number} 1
 */
export function randomNum(min: number, max: number): number {
  const num = Math.floor(Math.random() * (min - max) + max);
  return num;
}

/**
 * @description 获取当前时间对应的提示语
 */
export function getTimeState() {
  const timeNow = new Date();
  const hours = timeNow.getHours();
  if (hours >= 6 && hours <= 10) return `早上好 ⛅`;
  if (hours >= 10 && hours <= 14) return `中午好 🌞`;
  if (hours >= 14 && hours <= 18) return `下午好 🌞`;
  if (hours >= 18 && hours <= 24) return `晚上好 🌛`;
  if (hours >= 0 && hours <= 6) return `凌晨好 🌛`;
}

/**
 * @description 获取浏览器默认语言
 */
export function getBrowserLang() {
  const browserLang = navigator?.language;
  let defaultBrowserLang = '';
  defaultBrowserLang = ['cn', 'zh', 'zh-cn'].includes(browserLang.toLowerCase()) ? 'zh' : 'en';
  return defaultBrowserLang;
}

/**
 * @description 格式化表格单元格默认值 (el-table-column)
 * @param {number} _row 行
 * @param {number} _col 列
 * @param {*} callValue 当前单元格值
 * @returns {string} 字符串
 */
export function formatTableColumn(_row: number, _col: number, callValue: any) {
  // 如果当前值为数组，使用 / 拼接（根据需求自定义）
  if (isArray(callValue)) return callValue.length > 0 ? callValue.join(' / ') : '--';
  return callValue ?? '--';
}

/**
 * @description 处理 ProTable 值为数组 || 无数据
 * @param {*} callValue 需要处理的值
 * @returns {string} 1
 */
export function formatValue(callValue: any) {
  // 如果当前值为数组，使用 / 拼接（根据需求自定义）
  if (isArray(callValue)) return callValue.length > 0 ? callValue.join(' / ') : '--';
  return callValue ?? '--';
}

/**
 * @description 处理 prop 为多级嵌套的情况，返回的数据 (列如: prop: user.name)
 * @param {object} row 当前行数据
 * @param {string} prop 当前 prop
 * @returns {*} 1
 */
export function handleRowAccordingToProp(row: { [key: string]: any }, prop: string) {
  if (!prop.includes('.')) return row[prop] ?? '--';
  prop.split('.').forEach((item) => (row = row[item] ?? '--'));
  return row;
}

/**
 * @description 处理 prop，当 prop 为多级嵌套时 ==> 返回最后一级 prop
 * @param {string} prop 当前 prop
 * @returns {string} 字符串
 */
export function handleProp(prop: string) {
  const propArr = prop.split('.');
  if (propArr.length === 1) return prop;
  return propArr[propArr.length - 1];
}

/**
 * @description 根据枚举列表查询当需要的数据（如果指定了 label 和 value 的 key值，会自动识别格式化）
 * @param {string} callValue 当前单元格值
 * @param {Array} enumData 字典列表
 * @param {Array} fieldNames label && value && children 的 key 值
 * @param {string} type 过滤类型（目前只有 tag）
 * @returns {string} 字符串
 */
export function filterEnum(
  callValue: any,
  enumData?: any,
  fieldNames?: FieldNamesProps,
  type?: 'tag'
) {
  const value = fieldNames?.value ?? 'value';
  const label = fieldNames?.label ?? 'label';
  const children = fieldNames?.children ?? 'children';
  let filterData: {
    [key: string]: any;
    tagType?: any;
  } = {};
  // 判断 enumData 是否为数组
  if (Array.isArray(enumData)) filterData = findItemNested(enumData, callValue, value, children);
  // 判断是否输出的结果为 tag 类型
  if (type === 'tag') {
    return filterData?.tagType || '';
  } else {
    return filterData ? filterData[label] : '--';
  }
}

/**
 * @description 递归查找 callValue 对应的 enum 值
 */
export function findItemNested(enumData: any, callValue: any, value: string, children: string) {
  return enumData.reduce((accumulator: any, current: any) => {
    if (accumulator) return accumulator;
    if (current[value] === callValue) return current;
    if (current[children]) return findItemNested(current[children], callValue, value, children);
  }, null);
}

/**
 * @description: 验证日期字符串是否为有效的日期
 * @param {any} dateString
 * @return {*}
 */
export function isValidDate(dateString: any): boolean {
  return dayjs(dateString).isValid();
}

/**
 * @description: 获取月份
 * @param {string} dateStr
 * @return {*}
 */
export function getMonthByDateStr(dateStr: string) {
  const month = dayjs(dateStr || undefined).get('month') + 1;
  return month;
}

/**
 * @description: 获取时间默认值
 * @return {*}
 */
export function getDefaultTime(format = DEFAULT_TIME_FORMAT, dateStr?: string) {
  // 获取当前时间
  const now = dayjs(dateStr || undefined);
  const date = [now.subtract(7, 'day').format(format), now.format(format)];
  return date;
}

export function getTimePickerShortcuts() {
  return [
    {
      text: '近一周',
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
        return [start, end];
      },
    },
    {
      text: '近一个月',
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
        return [start, end];
      },
    },
    {
      text: '近三个月',
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
        return [start, end];
      },
    },
  ];
}

export function getDatePickerShortcuts() {
  return [
    {
      text: '今天',
      value: new Date(),
    },
    {
      text: '昨天',
      value: () => {
        const date = new Date();
        date.setTime(date.getTime() - 3600 * 1000 * 24);
        return date;
      },
    },
    {
      text: '一周前',
      value: () => {
        const date = new Date();
        date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
        return date;
      },
    },
  ];
}

type TreeChangeOptionsType = {
  children?: string;
  cusId?: string;
  getLastLevelExtraDataList?: any;
  key?: string;
  label?: string;
  treePathKey?: string;
  value?: string;
};

/**
 * @description: 更改树数据树型
 * @param {any[]} treeData
 * @param {TreeChangeOptionsType[]} options 表示需要转换的树型数据参数 , 用于取值
 * @param {TreeChangeOptionsType[]} gOprions 表示需要转换后输出的树型数据参数， 用于生成值
 * @return {*}
 *
 * ```
 * example
 *
 * changeTreeDataProp(resData, {
    label: 'fullName',
    value: 'departmentId',
  })
 * ```
 */
export function changeTreeDataProp(
  treeData: any[],
  options: TreeChangeOptionsType = {},
  gOprions: TreeChangeOptionsType = {}
): any[] {
  const defaultOptions = {
    label: options?.label || 'label',
    value: options?.value || 'value',
    children: options?.children || 'children',
  };
  const defaultGOptions = {
    label: gOprions?.label || 'label',
    value: gOprions?.value || 'value',
    children: gOprions?.children || 'children',
  };
  const { label, value, children } = defaultOptions;
  const { label: gLabel, value: gValue, children: gChildren } = defaultGOptions;

  let tData = [];
  if (isNotEmptyArr(treeData)) {
    tData = treeData.map((ele: any) => {
      ele[`${gLabel}`] = ele[label];
      ele[`${gValue}`] = ele[value];

      const childArr = ele?.[children] || [];

      ele[gChildren] = isNotEmptyArr(childArr)
        ? changeTreeDataProp(childArr, defaultOptions, defaultGOptions)
        : [];
      return ele;
    });
  }

  return tData;
}

/**
 * @description: 经过特殊处理的更改树数据树型
 * @param {any[]} treeData
 * @param {TreeChangeOptionsType[]} options 表示需要转换的树型数据参数 , 用于取值
 * @param {TreeChangeOptionsType[]} gOprions 表示需要转换后输出的树型数据参数， 用于生成值
 * @return {*}
 *
 * ```
 * example
 *
 * changeTreeDataProp(resData, {
    label: 'fullName',
    value: 'departmentId',
  })
 * ```
 */
export function sepcChangeTreeDataProp(
  treeData: any[],
  options: TreeChangeOptionsType = {},
  gOprions: TreeChangeOptionsType = {}
): any[] {
  const defaultOptions = {
    label: options?.label || 'label',
    value: options?.value || 'value',
    children: options?.children || 'children',
  };
  const defaultGOptions = {
    cusId: gOprions?.cusId || 'cusId',
    label: gOprions?.label || 'label',
    value: gOprions?.value || 'value',
    children: gOprions?.children || 'children',
  };
  const { label, value, children } = defaultOptions;
  const { cusId, label: gLabel, value: gValue, children: gChildren } = defaultGOptions;

  const recFun = (tData: any[], pItem?: any) => {
    let nTData = [];

    if (isNotEmptyArr(tData)) {
      nTData = tData.map((ele) => {
        const cKey = ele[value];
        ele[`${gLabel}`] = ele[label];
        ele[`${gValue}`] = cKey;

        if (cusId) {
          ele[`${cusId}`] = pItem?.[`${cusId}`]
            ? [pItem?.[`${cusId}`], cKey].filter(Boolean).join('-')
            : cKey;
        }

        const childArr = ele?.[children] || [];

        ele[gChildren] = isNotEmptyArr(childArr) ? recFun(childArr, ele) : [];
        return ele;
      });
    }

    return nTData;
  };

  return recFun(treeData);
}

/**
 * @description: 获取 views文件夹下的文件列表
 * @return {*}
 */
export function getViewVuePathList() {
  const pageObj = import.meta.glob('../../views/**/index.vue', {
    eager: true,
  });
  const list = Object.keys(pageObj).map((item) => item.replaceAll('../../', '/'));
  return list;
}

export function sleep(time = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

/**
 * @description: 通过树顶数据回显树路径
 * @param {any} treeData
 * @param {any} options
 * @return {*}
 * ```
 *   const { matchArr } = getValByTreeData(resList, {
      key: 'id',
      value: '33',
      type: 'equal' //  equal 表示等值匹配 ， like 表示模糊匹配 , endsWith 最后一级别匹配
    });
 * ```
 */
export function getValByTreeData(treeData: any[], options: any) {
  const { key, type, value } = options;
  const dType = ['endsWith', 'equal', 'like'].includes(type) ? type : 'like';

  const flatTreeArr: any[] = [];
  let matchArr: any[] = [];
  if (isArray(treeData) && treeData?.length && key && !isEmpty(value)) {
    const recFun = (tData: any[], pItem?: any) => {
      if (isArray(tData) && tData?.length) {
        return tData.map((ele) => {
          const { children } = ele;
          if (pItem?.cusId) {
            if (ele.cusId === undefined) {
              ele.cusId = '';
            }
            ele.cusId += [pItem?.cusId, ele[key]].filter(Boolean).join('-');
          } else {
            ele.cusId = ele[key];
          }
          if (children && children?.length) {
            ele.children = recFun(children, ele);
          }
          flatTreeArr.push(ele.cusId);
          return ele;
        });
      }
    };
    recFun(treeData);
    const sVal = String(value);
    matchArr = uniq(flatTreeArr).filter((cItem) => {
      switch (dType) {
        case 'endsWith': {
          return cItem.includes('-') ? cItem.endsWith(sVal) : cItem === value;
        }
        case 'equal': {
          const splArr = cItem.split('-');
          return splArr.includes(sVal);
        }
        case 'like': {
          return cItem.includes(sVal);
        }
        // No default
      }
    });
  }
  return {
    flatTreeArr,
    matchArr,
    treeData: cloneDeep(treeData),
  };
}

/**
 * @description: 模糊搜索树数据
 * @param {any} tData
 * @param {any} options
 * @return {*}
 * ```
 *   const { matchArr } = getTreeDataByFilter(resList, {
      key: 'id',
      value: '33',
      type: 'equal' //  equal 表示等值匹配，like 表示模糊匹配, endsWith 最后一级别匹配
    });
 * ```
 */
export function getTreeDataByFilter(tData: any[], options: any): any {
  const { matchArr, treeData } = getValByTreeData(tData, options);
  const recFun = (treeData: any[]) => {
    if (Array.isArray(treeData) && treeData.length > 0) {
      return treeData.filter((ele) => {
        const { children } = ele;
        if (children && children?.length) {
          ele.children = recFun(children);
        }
        return matchArr.find((item) => item.includes(ele.cusId));
      });
    }
  };
  const newTData = recFun(treeData);
  return newTData;
}

/**
 * @description: 深度查找数组对象内的值，用于查找二级三级目录路由
 * @param {object[]} array 要查找的路由
 * @param {string} key 查找对应的键名
 * @param {string | number} value 要查找对应的值
 * @param {string} children 下级集合的键名
 * @return {*}
 *
 * ```
 *  getTreeObject(departmentTypeList, 'id', 35);
 * ```
 */
export function getTreeObject(
  array: any[],
  key: any,
  value: any,
  children: string = 'children'
): any {
  let o;
  array.some(function iter(a) {
    if (a[key] === value) {
      o = a;
      return true;
    }
    // eslint-disable-next-line unicorn/no-array-callback-reference
    return Array.isArray(a[children]) && a[children].some(iter);
  });
  return o;
}

/**
 * @description: 树转数组
 * @return {*}
 */
export function convertTreeDataToArray(treeData: any[], options: TreeChangeOptionsType = {}): any {
  const result: any[] = [];
  const lastLevelData: any[] = [];
  const lastLevelIdData: any[] = [];
  const lastLevelExtraData: any[] = [];

  const defaultOptions = {
    key: options?.key || 'id',
    label: options?.label || 'label',
    treePathKey: options?.treePathKey || 'levelNumber',
    value: options?.value || 'value',
    children: options?.children || 'children',
  };

  const getLastLevelExtraDataList =
    typeof options?.getLastLevelExtraDataList === 'function'
      ? options?.getLastLevelExtraDataList
      : null;

  const { key, treePathKey, children } = defaultOptions;

  if (children) {
    const recFun = (tData: any, pId?: any) => {
      if (isNotEmptyArr(tData)) {
        tData.forEach((ele: any) => {
          const cList = ele?.[children];
          if (ele.hasOwnProperty(children)) {
            delete ele?.[children];
          }
          const id = ele[key];
          if (id) {
            ele[treePathKey] = pId ? `${pId}-${id}` : id;
          }
          result.push(ele);
          if (isNotEmptyArr(cList)) {
            recFun(cList, ele[treePathKey]);
          } else {
            lastLevelData.push(ele);
            id && lastLevelIdData.push(id);

            if (getLastLevelExtraDataList) {
              const extraData = getLastLevelExtraDataList(ele);
              extraData && lastLevelExtraData.push(extraData);
            }
          }
        });
      }
    };

    recFun(treeData);
  }

  return {
    lastLevelData,
    lastLevelExtraData,
    lastLevelIdData: uniq(lastLevelIdData),
    result,
  };
}

/**
 * @description: 下载文件
 * @param {string} url
 * @param {string} title
 * @return {*}
 */
export function downLoadFile(url: string, title?: string) {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  title && link.setAttribute('download', title); // 自定义下载文件名（如exemple.txt）
  document.body.append(link);
  link.click();
  window.URL.revokeObjectURL(link.href); // 释放url
  link.remove(); // 清除残留的文档片段<a></a>
}

/**
 * @description: 校验是否是非空对象
 * @param {any} obj
 * @return {*}
 */
export function isNotEmptyObj(obj: any): boolean {
  return isObject(obj) && !isEmpty(obj);
}

/**
 * @description: 校验是否是非空数组
 * @param {any} obj
 * @return {*}
 */
export function isNotEmptyArr(obj: any): boolean {
  return isArray(obj) && !isEmpty(obj);
}

/**
 * @description: 文件对象转base64 ， img中的 src 不能直接接受blob://file....文件
 * @param {File} file
 * @return {*}
 */
export function fileToBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader: FileReader = new FileReader();
    reader.addEventListener('load', (event: ProgressEvent<FileReader>) => {
      resolve(event.target?.result);
    });
    reader.addEventListener('error', (event: ProgressEvent<FileReader>) => {
      reject(event.target?.result);
    });
    reader.readAsDataURL(file); // 读取文件为DataURL
  });
}

// 校验是否是http/https链接
export function isHttp(str: string): boolean {
  // eslint-disable-next-line regexp/no-unused-capturing-group
  const reg = /(http|https):\/\/([\w.]+\/\?)\S*/;
  return reg.test(str);
}

/**
 * @description: 通过最后一级别层级回显上级
 * @param {any} levelNumber
 * @return {*}
 */
export function getOrgGroupIdArr(levelNumber: any): string[] {
  const newArr: string[] = [];
  if (levelNumber) {
    const splitArr = levelNumber?.split('');
    const arr: string[] = [];
    splitArr.forEach((ele: string) => {
      if (ele === '-') {
        arr.length > 0 && newArr.push(arr.join(''));
      }
      arr.push(ele);
    });
  }
  return newArr;
}

/**
 * @description:  获取当前月的最后一天
 * @param {any} val
 * @return {*}
 */
export function getLastDayOfCurrentMonth(val: any) {
  let now = new Date();
  now = val ? new Date(val) : new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  lastDay.setMinutes(lastDay.getMinutes() - lastDay.getTimezoneOffset());
  lastDay.setDate(lastDay.getDate());
  return lastDay.toJSON().slice(0, 10);
}

/**
 * @description:  获取日期
 * @param {any} query
 * @return {*}
 */
export function getCurDay(query: string) {
  const datetime = new Date();
  const year = datetime.getFullYear();
  const month =
    datetime.getMonth() + 1 < 10 ? `0${datetime.getMonth() + 1}` : datetime.getMonth() + 1;
  let date = '';
  if (query) {
    date = query;
  } else {
    date = datetime.getDate() < 10 ? `0${datetime.getDate()}` : datetime.getDate().toString();
  }
  return `${year}-${month}-${date}`;
}

/**
 * @description: 获取时间字符串
 * @param {向前偏移的时间 } offset
 * @param { 时间戳 } date
 * @return {*}
 */
export function getDateString(offset = 0, date = new Date(), endIndex = 10) {
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  date.setDate(date.getDate() + (offset || 0));
  return date.toJSON().slice(0, endIndex);
}

export function getDiffYear() {
  const noewYear = dayjs().year();
  const startYear = 2022;
  const diffYear = noewYear - startYear;
  return {
    diffYear,
    startYear,
  };
}

export function getYearColumns(field: string) {
  const { diffYear, startYear } = getDiffYear();

  if (diffYear > 0) {
    const newYearArr = [];
    for (let i = 0; i <= diffYear; i++) {
      const itemYear = startYear + i;
      const keyStr = `${field}.${itemYear}`;
      newYearArr.unshift({
        label: `${itemYear}年`,
        prop: keyStr,
        render: (scope: any) => {
          return renderMoneyCell(scope, keyStr);
        },
        width: 140,
      });
    }
    return newYearArr;
  } else {
    return [];
  }
}

export function getMonthDetailColumns() {
  const { diffYear, startYear } = getDiffYear();

  const getMonthColumns = (year: number | string) => {
    const monthArr = [];
    for (let i = 0; i < 13; i++) {
      if (i === 0) {
        const field = `extendDataField.${year}-total`;

        monthArr.push({
          label: '年合计',
          prop: field,
          render: (scope: any) => {
            return renderMoneyCell(scope, field);
          },
          width: 150,
        });
      } else {
        const field = `extendDataField.${year}-${i}`;
        monthArr.push({
          label: `${i}月`,
          prop: field,
          render: (scope: any) => {
            return renderMoneyCell(scope, field);
          },
          width: 120,
        });
      }
    }
    return monthArr;
  };

  if (diffYear > 0) {
    const newYearArr = [];
    for (let i = 0; i <= diffYear; i++) {
      const itemYear = startYear + i;
      newYearArr.unshift({
        _children: getMonthColumns(itemYear),
        label: `${itemYear}年`,
        prop: `itemYear`,
      });
    }
    return newYearArr;
  } else {
    return [];
  }
}

/**
 * @description: 通过点运算符字符串，读取属性
 * @param {any} obj
 * @param {string} path
 * @return {*}
 */
export function getNestedProperty(obj: any, path: string) {
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : undefined;
  }, obj);
}

/**
 * @description: 计算总和
 * @param {any[]} list
 * @param {string} field
 * @return {*}
 */
export function calcSum(list: any[], field: string | Function): number {
  let sumVal: number = 0;
  if (field) {
    list.forEach((ele) => {
      const val = typeof field === 'function' ? field(ele) : getNestedProperty(ele, field);
      sumVal += convertNumber(val);
    });
  }
  return numberRoundUp(sumVal);
}

/**
 * @description: 计算平均值
 * @param {any[]} list
 * @param {string} field
 * @return {*}
 */
export function calcAverage(list: any[], field: string | Function): number {
  let averageVal: number = 0;
  if (field) {
    const sumVal: number = calcSum(list, field);
    averageVal = numberRoundUp(sumVal / list.length);
  }
  return averageVal;
}

/**
 * @description: 获取table 合计行数据
 * @param {any} options
 * @return {*}
 */
export function getTableSummaries(options: any): any[] {
  const { averageColumns, columns, data, sumColumns, specSasColumns } = options;
  const sums: any[] = [];
  const sBool = isNotEmptyObj(specSasColumns);
  if (
    isNotEmptyArr(data) &&
    (isNotEmptyArr(averageColumns) || isNotEmptyArr(sumColumns) || sBool)
  ) {
    let specColumns: string[] = [];
    if (sBool) {
      specColumns = Object.keys(specSasColumns);
    }
    columns.forEach((column: any, index: number) => {
      const property = column?.property;
      if ([0, 1].includes(index) && column?.label === '#') {
        if (column?.type === 'selection') {
          sums[index] = '合计';
        }

        if (column?.type === 'index') {
          sums[index] = `共${data.length}条`;
        }
      } else {
        if (averageColumns.includes(property)) {
          sums[index] = calcAverage(data, property);
        } else if (sumColumns.includes(property)) {
          sums[index] = calcSum(data, property);
        } else if (specColumns.includes(property)) {
          const sFun = specSasColumns[property];
          sums[index] = typeof sFun === 'function' ? sFun(data, property) : '';
        } else {
          sums[index] = '';
        }
      }
    });
  }

  return sums;
}

/**
 * @description: 获取ag-table合计行数据
 * @param {any} options
 * @return {*}
 */
export function getTableAgSummaries(options: any): any[] {
  const { averageColumns, columns, data, sumColumns, specSasColumns } = options;
  const sums: ObjectType = {};
  const sBool = isNotEmptyObj(specSasColumns);
  if (
    isNotEmptyArr(data) &&
    (isNotEmptyArr(averageColumns) || isNotEmptyArr(sumColumns) || sBool)
  ) {
    let specColumns: string[] = [];
    if (sBool) {
      specColumns = Object.keys(specSasColumns);
    }
    columns.forEach((column: any, index: number) => {
      const { headerName: label, field: property } = column;
      if ([0, 1].includes(index) && label === '#') {
        sums[property] = `共${data.length}条`;
      } else {
        sums[property] = '';
        if (property) {
          if (averageColumns.includes(property)) {
            sums[property] = calcAverage(data, property);
          } else if (sumColumns.includes(property)) {
            sums[property] = calcSum(data, property);
          } else if (specColumns.includes(property)) {
            const sFun = specSasColumns[property];
            sums[property] = typeof sFun === 'function' ? sFun(data, property) : '';
          }
        }
      }
    });
  }

  return [sums];
}

// 错误提示
export const showMessage = (
  obj: MessageProps | string,
  type?: MessageProps['type'],
  duration?: MessageProps['duration']
) => {
  let msgObj = {
    duration: duration || 2000,
    message: '错误',
    type: type || 'warning',
  };
  if (isObject(obj) && !isEmpty(obj)) {
    msgObj = Object.assign(msgObj, obj);
  } else {
    msgObj.message = obj as string;
  }
  ElMessage(msgObj);
};

// 提示
export const showNotification = (
  obj: NotificationProps | string,
  type?: NotificationProps['type'],
  title?: NotificationProps['title'],
  duration?: NotificationProps['duration']
) => {
  let msgObj = {
    duration: duration || 2000,
    message: '错误',
    title: title || '提示',
    type: type || 'warning',
  };
  if (isObject(obj) && !isEmpty(obj)) {
    msgObj = Object.assign(msgObj, obj);
  } else {
    msgObj.message = obj as string;
  }
  ElNotification(msgObj);
};

/**
 * @description: 确认弹窗
 * @return {*}
 */
export function showConfirm(obj: MessageProps, callback?: (res: MessageBoxData) => void) {
  const msgObj = {
    cancelButtonText: '取消',
    confirmButtonText: '确定',
    description: '您确定执行接下来的操作吗？',
    title: '提示',
    type: 'warning',
  };

  const { description, title, ...restObj } = Object.assign(msgObj, obj);

  ElMessageBox.confirm(description, title, {
    ...restObj,
  }).then((res: MessageBoxData) => {
    isFunction(callback) && callback(res);
  });
}

/**
 * @description: 提交内容弹窗
 * @return {*}
 */
export function showPrompt(obj: MessageProps, callback?: (res: MessageBoxData) => void) {
  const msgObj = {
    cancelButtonText: '取消',
    confirmButtonText: '确定',
    description: '您确定执行接下来的操作吗？',
    inputErrorMessage: '输入不能为空',
    inputPattern: /^ +$/,
    title: '提示',
    type: 'warning',
  };

  const { description, title, ...restObj } = Object.assign(msgObj, obj);

  ElMessageBox.prompt(description, title, {
    ...restObj,
  }).then((res: MessageBoxData) => {
    isFunction(callback) && callback(res);
  });
}

/**
 * @description: 对象参数序列化
 * @param {any} obj
 * @return {*}
 */
export function paramsQueryString(obj: any): string {
  let str: string = '';
  if (isNotEmptyObj(obj)) {
    str = Object.entries(obj)
      .filter((ele) => ![null, undefined].includes(ele?.[1] as any))
      .map((ele) => `${ele[0]}=${ele[1]}`)
      .join('&');
  }
  return str;
}

type TreeDataItem = {
  [key: string]: any;
  children?: TreeDataItem[];
  disabled?: boolean;
  id: number | string;
};

/**
 * @description: 获取禁用的树型数据
 * @param {*} treeData 树型数据
 * @param {*} diusabledIdList 禁用的id列表
 * @return {*}
 */
export function disabledTreeData(
  treeData: TreeDataItem[],
  diusabledIdList: (number | string)[]
): TreeDataItem[] {
  if (isNotEmptyArr(diusabledIdList)) {
    const recFun = (tData: any) => {
      return isNotEmptyArr(tData)
        ? tData.map((ele: TreeDataItem) => {
            if (diusabledIdList.includes(ele.id)) {
              ele.disabled = true;
            }
            if (ele?.children) {
              ele.children = recFun(ele.children);
            }
            return ele;
          })
        : [];
    };

    return recFun(treeData);
  } else {
    return treeData;
  }
}
