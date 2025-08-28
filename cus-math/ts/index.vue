<!--
 * @Author: Null 779217162@qq.com
 * @Date: 2025-08-28 14:06:23
 * @LastEditors: Null 779217162@qq.com
 * @LastEditTime: 2025-08-28 14:37:18
 * @FilePath: \Archer\cus-math\ts\index.vue
 * @Description: ts示例
-->
<script lang="ts" setup name="Build">
import { CusMath } from './cusMath';

const cusMath = new CusMath();
console.log('cusMath123123123', cusMath)

function calcFun1() {
  const calcInstance = cusMath
    .operation('add', 3.251, 253.635, 1.25, 42)
    .operation('sub', 63.652, 4.952);
  const totalLogs = calcInstance._logs;
  const totalVal = calcInstance.end();
  console.log('totalLogs=====>', totalLogs); // 方法链式调用日志
  console.log('totalVal=====>', totalVal);
}

function calcFun2() {
  const otherInstance = cusMath
    .add(3.251, 253.635, 1.25, 42)
    .sub(63.652, 4.952);
  const otherLogs = otherInstance._logs;
  const otherVal = otherInstance.end();
  console.log('otherLogs=====>', otherLogs); // 方法链式调用日志
  console.log('otherVal=====>', otherVal);
}

function calcFun3() {
  const str =
    '((20.124 * 2.35 / 5.96 + 20.124 * 65 / 3 - 20.124 + 2.35 * 5.96) / 2.36) * 3.241 + 2.53 * 5.96';
  // const str = '5 * 2 - 3 + 5 * 6 / 3 + 6 - 8 + 41'
  // const str = '5 * 2 - (3 * (5 * 6 / 3 + 6) ) * 12 - 8 + 41'
  // const str = '0.1+0.2'
  const result = cusMath.expression(str);
  console.log('resultexpression=====>', result);
  const logs = cusMath._logs;
  console.log('运算公式演变logs=====>', logs);
  cusMath.end()
}

function calcFun4() {
  const str = '0.1+0.2';
  const result = cusMath.expression(str);
  console.log('resultexpression=====>', result);
  const logs = cusMath._logs;
  console.log('运算公式演变logs=====>', logs);
  cusMath.end()
}

function calcFun5() {
  const str = '0.3/2';
  const result = cusMath.expression(str);
  console.log('resultexpression=====>', result);
  const logs = cusMath._logs;
  console.log('运算公式演变logs=====>', logs);
  cusMath.end()
}
</script>

<template>
  <div>
    <el-button type="primary" @click="calcFun1()">计算1</el-button>
    <el-button type="primary" @click="calcFun2()">计算2</el-button>
    <el-button type="primary" @click="calcFun3()">计算3</el-button>
    <el-button type="primary" @click="calcFun4()">计算4</el-button>
    <el-button type="primary" @click="calcFun5()">计算5</el-button>
  </div>
</template>
