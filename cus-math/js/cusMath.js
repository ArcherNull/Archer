/*
 * @Author: Null 779217162@qq.com
 * @Date: 2025-08-28 14:20:36
 * @LastEditors: junsong Chen  779217162@qq.com
 * @LastEditTime: 2025-12-04 10:20:37
 * @FilePath: \Archer\cus-math\js\cusMath.js
 * @Description: 自定义计算类
 */
export class CusMath {
  static _precision = 15; // 精度，toPrecision的值，最大21

  // 操作记录
  _logs = [];
  // 原始的表达式
  _original_expression = '';
  // 过程表达式
  _process_expression = '';
  // 过程值
  _processValue;

  // 初始化获取表达式操作代理
  get expressionOperationProxy() {
    const proxy = {
      '+': CusMath.accAdd,
      '-': CusMath.accSub,
      '*': CusMath.accMul,
      '/': CusMath.accDiv,
    };
    return proxy;
  }

  // 初始化获取操作代理
  get operationProxy() {
    const proxy = {
      add: CusMath.accAdd,
      sub: CusMath.accSub,
      mul: CusMath.accMul,
      div: CusMath.accDiv,
    };
    return proxy;
  }

  constructor() {
    this.init();
  }

  /**
   * @description: 加法函数，用来得到精确的加法结果
   * @param {*} arg1
   * @param {*} arg2
   * @return {*}
   * ```
   * 说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
   * 调用：accAdd(arg1,arg2)
   * 返回值：arg1加上arg2的精确结果
   * ```
   */
  static accAdd(arg1, arg2) {
    let m = 0;
    const r1 = CusMath.getPrecision(arg1);
    const r2 = CusMath.getPrecision(arg2);

    m = 10 ** Math.max(r1, r2);
    const val = (arg1 * m + arg2 * m) / m || 0;
    return val ? Number(val.toPrecision(CusMath._precision)) : 0;
  }

  /**
   * @description: 除法函数，用来得到精确的除法结果;
   * @param {*} arg1
   * @param {*} arg2
   * @return {*}
   *
   * ```
   * 说明：javascript的除法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的除法结果。
   * 调用：this.accMul(arg1,arg2)
   * 返回值：arg1乘以arg2的精确结果
   * ```
   */
  static accDiv(arg1, arg2) {
    const t1 = CusMath.getPrecision(arg1);
    const t2 = CusMath.getPrecision(arg2);
    const r1 = CusMath.convertNumber(arg1.toString().replace('.', ''));
    const r2 = CusMath.convertNumber(arg2.toString().replace('.', ''));
    return CusMath.accMul(r1 / r2, 10 ** (t2 - t1));
  }

  /**
   * @description: 乘法函数，用来得到精确的乘法结果;
   * @param {*} arg1
   * @param {*} arg2
   * @return {*}
   *
   * ```
   * 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
   * 调用：this.accMul(arg1,arg2)
   * 返回值：arg1乘以arg2的精确结果
   * ```
   */
  static accMul(arg1, arg2) {
    let m = 0;
    const s1 = arg1.toString();
    const s2 = arg2.toString();

    m += CusMath.getPrecision(arg1);
    m += CusMath.getPrecision(arg2);

    const arg1Val = Number(s1.replace('.', ''));
    const arg2Val = Number(s2.replace('.', ''));

    const val = ((arg1Val * arg2Val) / 10 ** m).toPrecision(CusMath._precision);

    return Number(val);
  }

  /**
   * @description: 减法函数
   * @param {*} arg2
   * @param {*} arg1
   * @return {*}
   * ```
   * 说明：减法函数。
   * 调用：accAdd(arg1,arg2)
   * 返回值：arg1减去arg2的精确结果
   * ```
   */
  static accSub(arg2, arg1) {
    const r1 = CusMath.getPrecision(arg1);
    const r2 = CusMath.getPrecision(arg2);

    const m = 10 ** Math.max(r1, r2);
    // last modify by deeka
    // 动态控制精度长度
    const n = Math.max(r1, r2);
    const mVal = (arg2 * m - arg1 * m) / m || 0;
    const val = mVal ? Number(mVal.toPrecision(CusMath._precision)) : 0;
    return Number(val.toFixed(n));
  }

  /**
   * @description: 转换为数字
   * @param {unknown} num
   * @return {number} 数字
   */
  static convertNumber(num) {
    const val = Number(num);
    return Number.isNaN(val) ? 0 : val;
  }

  /**
   * @description: 获取小数值的精度
   * @param {string | number} val
   * @return {number} 精度
   */
  static getPrecision(val) {
    const r = 0;
    const str = val.toString();
    if (str.includes('.')) {
      const arr = str.split('.');
      const demicalVal = arr[1] || '';
      if (demicalVal) {
        return demicalVal.length;
      }
    }
    return r;
  }

  // 计算平铺的表达式
  calcFlatExpress(expStr) {
    console.log('计算平铺的表达式', expStr);
    // 转换操作， +- => - ;  ++ => + ; -- => + ;  -+ => -
    const dealExpStr = expStr
      ?.replace(/\s/g, '')
      ?.replace(/\+\+/g, '+')
      ?.replace(/--/g, '+')
      ?.replace(/-\+/g, '-');
    console.log('dealExpStr', dealExpStr);
    // 使用正则表达式匹配所有数字和运算符
    const parts = dealExpStr.split(/([+-])/);
    console.log('parts', parts);

    // 挑出乘除的字符串
    const mulOrDivArr = [];
    // eslint-disable-next-line unicorn/prefer-structured-clone
    const cloneParts = JSON.parse(JSON.stringify(parts));
    cloneParts.forEach((ele, index) => {
      if (!['+', '-'].includes(ele) && Number.isNaN(Number(ele))) {
        mulOrDivArr.push({
          ele,
          index,
        });
      }
    });

    let val = 0;

    if (mulOrDivArr?.length) {
      for (const { ele: expStr, index } of mulOrDivArr) {
        const result = this.getFlatExpressResult(expStr);
        console.log('result', result);
        cloneParts.splice(index, 1, result);
      }
    }

    if (cloneParts?.length > 1) {
      const finalExpStr = cloneParts.join('');
      val = this.getFlatExpressResult(finalExpStr);
    } else {
      val = cloneParts[0] || 0;
    }
    return val;
  }

  /**
   * @description: 转换为数字
   * @param {any} num
   * @return {number} 数字
   */
  convertNumber(num) {
    const val = Number(num);
    return Number.isNaN(val) ? 0 : val;
  }

  /**
   * @description: 数字字符串转百分比
   * @param {string} str 数字字符串
   * @param {number} number 保留几位
   * @return {string} `0%`
   */
  convertNumToPercentage(str, number = 2) {
    if (str) {
      // eslint-disable-next-line regexp/no-unused-capturing-group
      if (/^(-|\+)?\d+(\.\d+)?$/.test(String(str))) {
        const num = this.convertNumber(str);
        return `${this.numberRoundUp(num * 100).toFixed(number)}%`;
      } else {
        return `0%`;
      }
    } else {
      return `0%`;
    }
  }

  /**
   * @description: 将百分比字符串转义为数字
   * @param {string} str 百分比字符串
   * @return {number} 数字，例如0.2
   */
  convertPercentageToNum(str) {
    if (isPercentage(str)) {
      const num = this.convertNumber(str.replace('%', ''));
      return this.numberRoundUp(num / 100);
    } else {
      return 0;
    }
  }

  // 处理并计算一级括号的计算表达式
  dealAndCalcFirstBracketArr() {
    let val = 0;
    const bracketArr = this.getFirstBracketExpress(this._process_expression);
    if (this.isNotEmptyArr(bracketArr)) {
      console.log('解析括号数组', bracketArr);
      for (const bracketExpStr of bracketArr) {
        const result_val = this.calcFlatExpress(bracketExpStr);
        // 将括号内的表达式替换成最终计算的结果
        const regStr = `(${bracketExpStr})`;
        this._process_expression = this._process_expression.replace(
          regStr,
          result_val,
        );
        this.expLogPush(this._process_expression);
        console.log(
          `括号字符串【${regStr}】替换为【${result_val}】得到新表达式为【${this._process_expression}】`,
        );
      }

      // 递归循环去掉多层级的括号
      return this.dealAndCalcFirstBracketArr();
    } else {
      this.expLogPush(this._process_expression);
      val = this.calcFlatExpress(this._process_expression);
    }

    return val;
  }

  // 终止计算，重置_processValue为0
  end() {
    const endVal = this._processValue;
    this._processValue = 0;
    this._original_expression = '';
    this._process_expression = '';
    this._logs = [];
    return endVal;
  }

  // 表达式的日志push
  expLogPush(str) {
    str && !this._logs.includes(str) && this._logs.push(str);
  }

  // 表达式
  expression(expStr) {
    if (expStr && typeof expStr === 'string') {
      // 优先级，括号 > 乘除 > 加减
      const bool = this.validateExpression(expStr);
      if (bool) {
        this._original_expression = expStr;
        this._process_expression = expStr;
        this.expLogPush(this._process_expression);
        try {
          const result = this.dealAndCalcFirstBracketArr();
          this.expLogPush(result);
          this._processValue = result;
          return this;
        } catch (error) {
          console.log(error?.message);
        }
      } else {
        throw new Error('无效数学表达式');
      }
    } else {
      throw new Error('数学表达式为字符串且不能为空');
    }
  }

  // 拆解运算表达式
  getExpParts(expStr) {
    // 1. 处理连续的相同运算符
    // ++ 变为 +
    expStr = expStr.replaceAll('++', '+');
    // -- 变为 +
    expStr = expStr.replaceAll('--', '+');

    // 2. 移除开头的 +
    expStr = expStr.replace(/^\+/, '');

    // 3. 使用正则表达式匹配数字和运算符
    // 匹配规则：
    // - 数字：负号（仅当前面不是数字或运算符时）后跟数字，可选的小数部分
    // - 运算符：+、-、*、/
    const parts = [];
    let i = 0;

    while (i < expStr.length) {
      let char = expStr[i];

      // 处理负号开头的数字
      if (
        char === '-' &&
        (i === 0 || ['*', '+', '-', '/'].includes(expStr[i - 1]))
      ) {
        // 这是一个负号，不是减号，需要和后面的数字一起匹配
        let num = '-';
        i++;

        // 匹配数字部分
        while (i < expStr.length) {
          char = expStr[i];
          if (/\d|\./.test(char)) {
            num += char;
            i++;
          } else {
            break;
          }
        }

        parts.push(num);
      }
      // 处理普通数字
      else if (/\d/.test(char)) {
        let num = '';

        // 匹配数字部分
        while (i < expStr.length) {
          char = expStr[i];
          if (/\d|\./.test(char)) {
            num += char;
            i++;
          } else {
            break;
          }
        }

        parts.push(num);
      }
      // 处理运算符
      else if (['*', '+', '-', '/'].includes(char)) {
        // 处理 +- 和 -+ 的情况
        if (i < expStr.length - 1) {
          const nextChar = expStr[i + 1];
          if (
            (char === '+' && nextChar === '-') ||
            (char === '-' && nextChar === '+')
          ) {
            parts.push('-');
            i += 2;
            continue;
          }
        }

        parts.push(char);
        i++;
      }
      // 跳过空格
      else {
        i++;
      }
    }
    return parts;
  }

  // 获取一级括号的计算表达式
  getFirstBracketExpress(newStr) {
    const nStr = String(newStr);
    let matches = [];
    if (nStr.includes('(') && nStr.includes(')')) {
      const regex = /\(([^()]+)\)/g;
      matches = [...(newStr?.matchAll(regex) || [])].map((match) => match[1]);
    }
    return matches;
  }

  // 无优先级的，从左到右计算，执行计算并返回计算结果
  getFlatExpressResult(expStr) {
    const parts = this.getExpParts(expStr);
    console.log('运算符拆解', parts);

    let val = 0;
    if (this.isNotEmptyArr(parts)) {
      const expressKeyArr = Object.keys(this.expressionOperationProxy);
      const numArr = [];
      const operaArr = [];
      // 奇数是数字，偶数是计算操作符,
      for (const [i, ele] of parts.entries()) {
        const isOdd = this.isOddNumber(i + 1);
        if (isOdd) {
          const isNum = this.isNumber(ele);
          if (isNum) {
            numArr.push(ele);
          } else {
            throw new Error(`存在非数字项【${ele}】`);
          }
        } else {
          if (expressKeyArr.includes(ele) && !isOdd) {
            const operaFun = this.expressionOperationProxy[ele];
            if (typeof operaFun === 'function') {
              operaArr.push({
                operationName: operaFun?.name,
                operaFun,
                index: i,
              });
            } else {
              throw new TypeError(
                `expressionOperationProxy对象解析【${ele}】不是一个方法`,
              );
            }
          } else {
            throw new Error(`存在非数学运算符【${ele}】`);
          }
        }
      }
      const operaArrLen = operaArr.length;
      // 操作符不能为空, 如果为空则赋值第一个, 操作符相比于数字始终要少一个
      if (
        this.isNotEmptyArr(operaArr) &&
        operaArr.length === numArr.length - 1
      ) {
        while (operaArr.length > 0) {
          const arg1 = operaArrLen === operaArr.length ? numArr.shift() : val;
          const operaFunObj = operaArr.shift();
          const arg2 = numArr.shift();
          val = operaFunObj.operaFun(arg1, arg2);
        }
      } else {
        throw new Error(`逻辑错误`);
      }
    }

    return val;
  }

  // 实例初始化
  init() {
    const that = this;
    const funArr = Object.keys(that.operationProxy);
    funArr.forEach((funName) => {
      this[funName] = (...args) => {
        return this.operation(funName, ...args);
      };
    });
  }

  /**
   * @description: 是否是非空数组
   * @param {any} arr
   * @return {boolean} true / false
   */
  isNotEmptyArr(arr) {
    return Array.isArray(arr) && arr?.length > 0;
  }

  /**
   * @description: 是否是数字
   * @param {any} str
   * @return {boolean} true / false
   */
  isNumber(str) {
    const val = Number(str);
    return !Number.isNaN(val);
  }

  /**
   * @description: 是否是奇数
   * @param {number} num
   * @return {boolean} true / false
   */
  isOddNumber(num) {
    return num % 2 === 1;
  }

  /**
   * @description: 检测是否时百分比字符串
   * @param {string} str
   * @return {boolean} true / false
   */
  isPercentage(str) {
    // eslint-disable-next-line regexp/no-unused-capturing-group, regexp/no-super-linear-backtracking, regexp/optimal-quantifier-concatenation, regexp/no-misleading-capturing-group
    return /^(-|\+)?\d+(|(\.\d+)|\d+)%$/.test(str);
  }

  // 方法调用的日志push
  logPush(options) {
    const { operationName, result, params, type } = options;
    this._logs.push({
      operationName,
      result,
      type,
      params,
    });
  }

  /**
   * @description: 保留小数点后三位，最后第四位还存在小数点的，四舍五入
   * @param {*} num 数值
   * @param {*} accuracy 精度
   * @param {*} type  roundUp 向上取整， roundDown 向下取整， round 四舍五入
   * @return {*}
   */
  numberRoundUp(num, accuracy = 3, type = 'round') {
    const numVal = this.convertNumber(num);
    if (numVal) {
      const accuracyVal = 10 ** this.convertNumber(accuracy);
      const newVal = CusMath.accMul(numVal, accuracyVal);
      // 如果精度是3，则下方是对第四位小数进行操作的
      if (type === 'roundUp') {
        return Math.ceil(newVal) / accuracyVal;
      } else if (type === 'roundDown') {
        return Math.floor(newVal) / accuracyVal;
      } else {
        return Math.round(newVal) / accuracyVal;
      }
    } else {
      return 0;
    }
  }

  // 操作方法
  operation(type, ...args) {
    const that = this;
    const operaFun = this.operationProxy[type];
    if (typeof operaFun === 'function' && that.isNotEmptyArr(args)) {
      console.log('args=====>', args);
      this._processValue = args.reduce((a, b) => {
        const val = operaFun(that.convertNumber(a), that.convertNumber(b));
        that.logPush({
          operationName: operaFun?.name,
          result: val,
          type: 'chain',
          params: [a, b],
        });
        return val;
      }, this._processValue);
    }

    return this;
  }

  // 是否是表达式
  validateExpression(str) {
    // eslint-disable-next-line regexp/no-unused-capturing-group
    const mulReg = /^([^*]|\*[^*])*$/;
    // eslint-disable-next-line regexp/no-unused-capturing-group
    const divReg = /^([^/]|\/[^/])*$/;
    const newStr = str.replaceAll(/\s/g, '');

    // 不能出现连续的 ** 或者 // ，只能单个
    const mulBool = mulReg.test(newStr);
    const divBool = divReg.test(newStr);

    // 不能包含以下的其他特殊字符
    const rest = newStr.replaceAll(/\d+|[+\-*/.()]/g, '');
    return mulBool && divBool && !rest;
  }
}
