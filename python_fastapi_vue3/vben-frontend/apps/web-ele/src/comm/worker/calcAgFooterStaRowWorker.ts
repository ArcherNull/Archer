/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-06-05 14:40:28
 * @LastEditTime: 2025-06-10 09:30:02
 * @Description:
 */

type AggFuncType = string; // "sum" | "min" | "max" | "count" | "avg" | "first" | "last";

interface ColDefType {
  headerName: string;
  field: string;
  aggFunc: AggFuncType;
  index: number;
  [key: string]: unknown;
}

interface objectType {
  [key: string]: unknown;
}

/**
 * @description: 数字转换
 * @param {string} str
 * @return {*}
 */
function convertNumber(str: string): number {
  const val: number = parseFloat(str);
  return isNaN(val) ? 0 : val;
}

/**
 * @description: 获取小数值的精度
 * @param {number} val
 * @return {*}
 */
function getPrecision(val: number): number {
  let r: number = 0;
  const str: string = val.toString();
  if (str.indexOf('.') !== -1) {
    const arr: string[] = str.split('.');
    const demicalVal: string = arr[1] || '';
    if (demicalVal) {
      return demicalVal.length;
    }
  }
  return r;
}

/**
 * @description: 除法函数，用来得到精确的乘法结果;
 * @param {number} arg1
 * @param {number} arg2
 * @return {*}
 */
export function accDiv(arg1: number, arg2: number): number {
  let t1: number = getPrecision(arg1);
  let t2: number = getPrecision(arg2);
  let r1: number = convertNumber(arg1.toString().replace('.', ''));
  let r2: number = convertNumber(arg2.toString().replace('.', ''));
  return accMul(r1 / r2, Math.pow(10, t2 - t1));
}

/**
 * @description: 乘法函数，用来得到精确的乘法结果;
 * @param {*} arg1
 * @param {*} arg2
 * @return {*}
 *
 * ```
 * 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
 * 调用：accMul(arg1,arg2)
 * 返回值：arg1乘以arg2的精确结果
 * ```
 */
export function accMul(arg1: number, arg2: number): number {
  let m: number = 0;
  const s1: string = arg1.toString();
  const s2: string = arg2.toString();

  m += getPrecision(arg1);
  m += getPrecision(arg2);

  return (
    (convertNumber(s1.replace('.', '')) * convertNumber(s2.replace('.', ''))) /
    Math.pow(10, m)
  );
}

/**
 * @description: 加法函数，用来得到精确的加法结果
 * @param {number} arg1
 * @param {number} arg2
 * @return {*}
 * ```
 * 说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
 * 调用：accAdd(arg1,arg2)
 * 返回值：arg1加上arg2的精确结果
 * ```
 */
export function accAdd(arg1: number, arg2: number): number {
  let m: number = 0;
  let r1: number = getPrecision(arg1);
  let r2: number = getPrecision(arg2);

  m = Math.pow(10, Math.max(r1, r2));
  return (arg1 * m + arg2 * m) / m;
}

/**
 * @description: 减法函数
 * @param {number} arg2
 * @param {number} arg1
 * @return {*}
 * ```
 * 说明：减法函数。
 * 调用：accAdd(arg1,arg2)
 * 返回值：arg1减去arg2的精确结果
 * ```
 */
export function accSub(arg2: number, arg1: number): number {
  let r1: number = getPrecision(arg1);
  let r2: number = getPrecision(arg2);

  let m: number = Math.pow(10, Math.max(r1, r2));
  // last modify by deeka
  // 动态控制精度长度
  let n: number = r1 >= r2 ? r1 : r2;
  let mVal: number = (arg2 * m - arg1 * m) / m;
  return customToFixed(mVal, n);
}

/**
 * @description: Number.toFixed 的平替方法
 * @param {number} value
 * @param {number} decimalPlaces
 * @return {*}
 */
function customToFixed(value: number, decimalPlaces: number): number {
  const str: string = value.toString();
  if (str.indexOf('.') !== -1) {
    const arr: string[] = str.split('.');
    const intVal: string = arr[0] || '';
    const demicalVal: string = arr[1] || '';
    if (demicalVal) {
      const nVal: string = demicalVal.slice(0, decimalPlaces);
      const nStr: string = intVal + '.' + nVal;
      return convertNumber(nStr);
    }
  }
  return value;
}

/**
 * @description: 通过点运算符字符串，读取属性
 * @param {object} obj
 * @param {string} path
 * @return {*}
 */
function getNestedProperty(obj: Object, path: string): string {
  const val = path
    .split('.')
    .reduce<Object>((prev: Object, curr: string): string => {
      if (!prev || typeof prev !== 'object') return '';
      return curr && prev?.hasOwnProperty(curr)
        ? (prev as Record<any, string>)[curr] || ''
        : '';
    }, obj);

  return val.toString();
}

/**
 * @description: 计算底部合计行
 * @param {ColDefType} colDefs
 * @param {object[]} filterData
 * @return {*}
 */
export function calcTotalLine(
  colDefs: ColDefType[] = [],
  filterData: objectType[] = [],
): number[] {
  let totalRow: number[] = [];
  if (
    Array.isArray(filterData) &&
    filterData.length > 0 &&
    Array.isArray(colDefs) &&
    colDefs.length > 0
  ) {
    const aggFunArr: string[] = [
      'sum',
      'min',
      'max',
      'count',
      'avg',
      'first',
      'last',
    ];
    let fArr: string[] = [];
    let sArr: AggFuncType[] = [];
    let iArr: number[] = [];
    let tArr: number[] = [];
    if (Array.isArray(colDefs) && colDefs.length > 0) {
      for (let i = 0; i < colDefs.length; i++) {
        const colDef: ColDefType | undefined = colDefs[i];
        if (colDef) {
          colDef.index = i;
          if (
            colDef.aggFunc &&
            aggFunArr.includes(colDef.aggFunc) &&
            colDef.field
          ) {
            iArr.push(i);
            tArr.push(0);
            fArr.push(colDef.field);
            sArr.push(colDef.aggFunc);
          }
        }
      }
    }

    if (Array.isArray(fArr) && fArr.length > 0) {
      const tLen: number = filterData.length;
      for (let i = 0; i < filterData.length; i++) {
        const item: objectType | undefined = filterData[i];
        if (item) {
          for (let j = 0; j < fArr.length; j++) {
            const calcField: string = fArr[j] || '';
            if (calcField) {
              const aggFuncStr: AggFuncType = sArr[j] || '';
              if (typeof item === 'object' && item !== null) {
                const fVal: string = getNestedProperty(item, calcField);
                const fValNum: number = convertNumber(fVal);
                const csVal: number = tArr[j] || 0;

                if (aggFuncStr === 'sum') {
                  tArr[j] = accAdd(csVal, fValNum);
                } else if (aggFuncStr === 'min') {
                  if (csVal !== 0) {
                    if (csVal >= fValNum) {
                      tArr[j] = fValNum;
                    }
                  } else {
                    tArr[j] = fValNum;
                  }
                } else if (aggFuncStr === 'min') {
                  if (csVal !== 0) {
                    if (csVal <= fValNum) {
                      tArr[j] = fValNum;
                    }
                  } else {
                    tArr[j] = fValNum;
                  }
                } else if (aggFuncStr === 'avg') {
                  const avgVal: number = accSub(fValNum, tLen);
                  tArr[j] = accAdd(csVal, avgVal);
                } else if (aggFuncStr === 'first') {
                  if (i === 0) {
                    tArr[j] = fValNum;
                  }
                } else if (aggFuncStr === 'last') {
                  if (i === tLen - 1) {
                    tArr[j] = fValNum;
                  }
                }
              }
            }
          }
        }
      }

      // 双循环结束后，将统计的值插入
      for (let k = 0; k < iArr.length; k++) {
        const ind: number | undefined = iArr[k];
        if (ind !== undefined) {
          totalRow[ind] = tArr[k] || 0;
        }
      }
    }
  }

  return totalRow;
}

self.onmessage = async function (ele) {
  console.log('ele123123', ele);
  try {
    const config = ele.data;
    console.log('calcAgFooterStaRowWorker.js中配置参数=====>', config);
  } catch {
    self.postMessage({
      status: 'config.failed',
      message: `calcAgFooterStaRowWorker.js线程执行失败`,
    });
  }
};

/**
 * 处理错误的函数 主线程可以监听 Worker 是否发生错误。
 * 如果发生错误，Worker 会触发主线程的`error`事件。
 */
const ERROR = () => {
  // 发送错误信息
  self.postMessage({ message: 'error', data: [] });

  // `self.close()`用于在 Worker 内部关闭自身。
  self.close();
};

// 错误处理
self.addEventListener('error', (event) => {
  ERROR();

  // 输出错误信息
  console.log(
    'ERROR: Line ',
    event.lineno,
    ' in ',
    event.filename,
    ': ',
    event.message,
  );
});
