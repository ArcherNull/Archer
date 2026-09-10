/**
 * 数学计算工具模块
 * 功能：基于 mathjs 实现高精度数学运算
 * 支持操作：加减乘除、求和、求差、平均值、最大值、最小值、取整等
 * 特点：支持大数运算、表达式计算、精度控制
 */
/* eslint-disable jsdoc/require-returns-description */
/* eslint-disable ts/no-namespace */
import { all, type BigNumber, create, isBigNumber } from "mathjs"

// ======================== 基础类型判断 ========================

const isNumber = (value: any) => !Number.isNaN(Number(value))

/**
 * 判断是否为有效数字类型 (number 或 BigNumber)
 */
function isNumberLike(value: unknown): value is number | BigNumber | string {
  return typeof value === "number" || isNumber(value) || isBigNumber(value)
}

type ArgumentType = string | number | undefined

// 最大调用栈深度测试
// function getMaxCallStackSize(): number {
//   try {
//     return 1 + getMaxCallStackSize()
//   }
//   catch (e) {
//     return 1
//   }
// }
const MAX_CALL_STACK_SIZE = 1000

export namespace MathUtils {
  export const math = create(all, {
    number: "BigNumber",
    // precision: 20
  })

  export const config = {
    InvalidArgumentThrowError: false,
  }

  export interface IArgumentOptions {
    precision?: number
  }

  /**
   * 传参校验
   * @param argument
   * @returns
   */
  const checkArgument = (argument: ArgumentType[]) => {
    // null 可以强转成数字，记为0；undefined 强转时会记为NaN，故此处需要短路处理成0，因为undefined后续会被自动处理成0
    const InvalidArgument = argument.some(item => !isNumber(item || 0))

    if (config.InvalidArgumentThrowError && InvalidArgument)
      throw new Error("参数类型错误, 请传入数字或者字符串类型的数字")

    return InvalidArgument
  }

  /**
   * 传参修正
   * @description 先处理成字符串，去除空格，再转换为数字
   * @param argument
   * @returns
   */
  const correctArgument = (argument: ArgumentType): BigNumber => {
    const res = math.bignumber(String(argument || 0).replace(/\s+/g, "") || 0)
    return Number.isNaN(res) ? math.bignumber(0) : res
  }

  /**
   * 参数处理
   *
   * @description 将undefined、null转换为0
   */
  const handleArgument = (argument: number | string) => {
    return argument || 0
  }

  function evaluateLongExpressionNew(
    argument: BigNumber[],
    mode: "sum" | "diff",
  ): BigNumber | undefined {
    const ZERO = math.bignumber(0)

    // 处理空数组的边界情况
    if (argument.length === 0) {
      return mode === "sum" ? ZERO : undefined
    }

    // Diff模式：第一个元素减去剩余所有元素的总和
    if (mode === "diff") {
      const first = argument[0]
      const restSum = evaluateLongExpressionNew(argument.slice(1), "sum")
      return restSum !== undefined ? first.sub(restSum) : undefined
    }

    // Sum模式：分批次递归求和
    if (argument.length <= MAX_CALL_STACK_SIZE) {
      try {
        return argument.reduce((acc, val) => acc.add(val), ZERO)
      }
      catch (error) {
        console.error("计算表达式时出错:", error)
        return undefined
      }
    }

    // 分批次处理
    const batch = argument.slice(0, MAX_CALL_STACK_SIZE)
    const rest = argument.slice(MAX_CALL_STACK_SIZE)

    try {
      const batchSum = batch.reduce((acc, val) => acc.add(val), ZERO)
      const restSum = evaluateLongExpressionNew(rest, "sum")
      return restSum !== undefined ? batchSum.add(restSum) : undefined
    }
    catch (error) {
      console.error("计算表达式时出错:", error)
      return undefined
    }
  }

  function evaluateLongExpression(argument: (string | number | undefined)[], options?: IArgumentOptions): string {
    if (argument.length > MAX_CALL_STACK_SIZE) {
      // 将表达式拆分为 MAX_CALL_STACK_SIZE 大小的数组，再递归计算
      const expr = argument.slice(0, MAX_CALL_STACK_SIZE).join("+")
      const rest = argument.slice(MAX_CALL_STACK_SIZE)

      // 递归计算剩余部分
      const restResult = evaluateLongExpression(rest, options)

      // 合并结果
      const combinedExpr = `${expr} + ${restResult}`
      // console.log("combinedExpr:", combinedExpr)
      try {
        return math.format(math.evaluate(combinedExpr) || 0, { notation: "fixed", precision: options?.precision })
      }
      catch (error) {
        console.error("计算表达式时出错:", error)
        return "错误: 表达式计算失败"
      }
    }
    else {
      // 直接计算表达式
      const expr = argument.join("+")
      try {
        return math.format(math.evaluate(expr) || 0, { notation: "fixed", precision: options?.precision })
      }
      catch (error) {
        console.error("计算表达式时出错:", error)
        return "错误: 表达式计算失败"
      }
    }
  }

  /**
   * 加法
   * @param a
   * @param b
   * @param options
   * @returns
   */
  export function add(a: ArgumentType, b: ArgumentType, options?: IArgumentOptions) {
    if (checkArgument([a, b]))
      return

    return math.format(correctArgument(a).add(correctArgument(b)), { notation: "fixed", precision: options?.precision })
  }

  /**
   * 求和
   * @param argument
   * @param options
   * @returns
   */
  export function sum(argument: ArgumentType[], options?: IArgumentOptions) {
    if (checkArgument(argument))
      return

    // return evaluateLongExpression(argument.map(item => correctArgument(item).valueOf()), options)
    return math.format(evaluateLongExpressionNew(argument.map(item => correctArgument(item)), "sum"), { notation: "fixed", precision: options?.precision })
  }

  /**
   * 减法
   * @param a
   * @param b
   * @param options
   * @returns
   */
  export function subtract(a: ArgumentType, b: ArgumentType, options?: IArgumentOptions) {
    if (checkArgument([a, b]))
      return

    return math.format(correctArgument(a).sub(correctArgument(b)), { notation: "fixed", precision: options?.precision })
  }

  /**
   * 求差 | 连减
   * @param argument
   * @param options
   * @returns
   */
  export function diff(argument: ArgumentType[], options?: IArgumentOptions) {
    if (checkArgument(argument))
      return

    return math.format(evaluateLongExpressionNew(argument.map(item => correctArgument(item)), "diff"), { notation: "fixed", precision: options?.precision })
  }

  /**
   * 乘法
   * @param a
   * @param b
   * @param options
   * @returns
   */
  export function multiply(a: ArgumentType, b: ArgumentType, options?: IArgumentOptions) {
    if (checkArgument([a, b]))
      return

    return math.format(correctArgument(a).mul(correctArgument(b)), { notation: "fixed", precision: options?.precision })
  }

  /**
   * 除法
   * @param a
   * @param b
   * @param options
   * @returns
   */
  export function divide(a: ArgumentType, b: ArgumentType, options?: IArgumentOptions) {
    if (checkArgument([a, b]))
      return

    // 0 不能作为除数 否则将此式子的结果设置为0
    const divisor = correctArgument(b)
    return math.format(divisor.eq(0) ? divisor : correctArgument(a).div(divisor), { notation: "fixed", precision: options?.precision })
  }

  /**
   * 平均值
   * @param argument
   * @param options
   * @returns
   */
  export function average(argument: ArgumentType[], options?: IArgumentOptions & { length?: number }) {
    return divide(sum(argument), options?.length || argument.length, options)
  }

  // ======================== 比较操作 ========================
  /**
   * 判断两个数字是否相等 (自动处理类型差异)
   */
  export function isEqual(a: ArgumentType, b: ArgumentType): boolean {
    if (typeof a === "number" && typeof b === "number") {
      return a === b
    }
    const aBN = correctArgument(a)
    const bBN = correctArgument(b)
    return math.equal(aBN, bBN) === true
  }

  /**
   * 判断 a 是否大于 b
   */
  export function isGreater(a: ArgumentType, b: ArgumentType, isEqual = false): boolean {
    if (typeof a === "number" && typeof b === "number") {
      return a > b
    }
    const aBN = correctArgument(a)
    const bBN = correctArgument(b)
    return (isEqual ? math.largerEq : math.larger)(aBN, bBN) === true
  }

  /**
   * 判断 a 是否小于 b
   */
  export function isLess(a: ArgumentType, b: ArgumentType, isEqual = false): boolean {
    if (typeof a === "number" && typeof b === "number") {
      return a < b
    }
    const aBN = correctArgument(a)
    const bBN = correctArgument(b)
    return (isEqual ? math.smallerEq : math.smaller)(aBN, bBN) === true
  }

  // ======================== 范围检查 ========================
  /**
   * 判断数字是否在 [min, max] 范围内
   */
  export function isInRange(
    value: ArgumentType,
    min: ArgumentType,
    max: ArgumentType,
    options: { inclusive: boolean } = { inclusive: true },
  ): boolean {
    const isMinValid = options.inclusive ? isGreater(value, min) || isEqual(value, min) : isGreater(value, min)
    const isMaxValid = options.inclusive ? isLess(value, max) || isEqual(value, max) : isLess(value, max)
    return isMinValid && isMaxValid
  }

  // ======================== 极值处理 ========================
  /**
   * 返回数组中的最大值 (自动处理空数组和无效值)
   */
  export function maxSafe(values: ArgumentType[], options?: { abs: boolean }): ArgumentType | undefined {
    if (values.length === 0)
      return undefined

    // 是否需要使用绝对值比较
    const useAbs = options?.abs === true
    if (!useAbs) {
      return values.reduce((acc, curr) => (isGreater(curr, acc) ? curr : acc))
    }
    return values.reduce((accumulator, currentValue) => {
      const absCurrent = correctArgument(currentValue).abs().valueOf()
      const absAccumulator = correctArgument(accumulator).abs().valueOf()
      return isGreater(absCurrent, absAccumulator) ? currentValue : accumulator
    })
  }

  /**
   * 返回数组中的最小值 (自动处理空数组和无效值)
   */
  export function minSafe(values: ArgumentType[]): ArgumentType | undefined {
    if (values.length === 0)
      return undefined
    return values.reduce((acc, curr) => (isLess(curr, acc) ? curr : acc))
  }

  /**
   * 取绝对值
   */
  export function abs(value: ArgumentType) {
    if (checkArgument([value]))
      return

    return correctArgument(value).abs().valueOf()
  }

  // ======================== 取整操作 ========================
  /**
   * 取整操作枚举
   */
  export enum RoundMode {
    /** 完全截取整数部分 */
    TRUNC = "trunc",
    /** 向上取整 */
    CEIL = "ceil",
    /** 向下取整 */
    FLOOR = "floor",
    /** 四舍五入 */
    ROUND = "round",
  }

  /**
   * 取整操作
   * @param value 需要取整的数值
   * @param mode 取整模式，默认为四舍五入
   * @param options 可选参数，包含精度设置
   * @returns 取整后的结果
   */
  export function round(value: ArgumentType, mode: RoundMode = RoundMode.ROUND, options?: IArgumentOptions) {
    if (checkArgument([value]))
      return

    const num = correctArgument(value)
    let result: BigNumber

    switch (mode) {
      case RoundMode.TRUNC:
        // 完全截取整数部分
        // mathjs 可能没有 trunc 方法，使用 floor 处理正数，ceil 处理负数
        result = num.gte(0) ? math.floor(num) : math.ceil(num)
        break
      case RoundMode.CEIL:
        // 向上取整
        result = math.ceil(num)
        break
      case RoundMode.FLOOR:
        // 向下取整
        result = math.floor(num)
        break
      case RoundMode.ROUND:
      default:
        // 四舍五入
        result = math.round(num)
        break
    }

    return math.format(result, { notation: "fixed", precision: options?.precision })
  }
}

// const numbers = [0.1, 0.1, 0.1]

// // 使用 reduce 实现累加
// const sum = numbers.reduce((accumulator, currentValue) => {
//   return accumulator + currentValue
// }, 0) // 初始值为 0

// console.log(`- 数组的和为: ${sum}`)
// console.log(`- 数组的和为: ${numbers.reduce((accumulator, currentValue) => accumulator.add(currentValue), MathUtils.math.bignumber(0))}`)
// console.log(MathUtils.sum(Array.from({ length: MAX_CALL_STACK_SIZE * MAX_CALL_STACK_SIZE + 1 }).map((_, index) => index + 1)))
