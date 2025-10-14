## cus-math
自定义计算类，用于解决js精度问题，类有js和ts版本

## 使用方式
* operation方法链式调用
* 运算符方法链式调用
* 表达式字符串

```javascript
import { CusMath } from "./cusMath.js";
const cusMath = new CusMath()

// 第一种方式
const calcInstance = cusMath.operation('add', 3.251, 253.635, 1.25, 42).operation('sub', 63.652, 4.952)
const totalLogs = calcInstance._logs
const totalVal = calcInstance.end()

// console.log('totalLogs=====>', totalLogs) // 方法链式调用日志
console.log('totalVal=====>', totalVal)

// 第二种方式
const otherInstance = cusMath.add(3.251, 253.635, 1.25, 42).sub(63.652, 4.952)
const otherLogs = otherInstance._logs
const otherVal = otherInstance.end()
// console.log('otherLogs=====>', otherLogs) // 方法链式调用日志
console.log('otherVal=====>', otherVal)


// 第三种方式，接受表达式
const str = '((20.124 * 2.35 / 5.96 + 20.124 * 65 / 3 - 20.124 + 2.35 * 5.96) / 2.36) * 3.241 + 2.53 * 5.96'
// const str = '5 * 2 - 3 + 5 * 6 / 3 + 6 - 8 + 41'
// const str = '5 * 2 - (3 * (5 * 6 / 3 + 6) ) * 12 - 8 + 41'
// const str = '0.1+0.2'
cusMath.expression(str)
const logs = cusMath._logs
console.log('运算公式演变logs=====>', logs)
const result = cusMath.end()
console.log('resultexpression=====>', result)
```