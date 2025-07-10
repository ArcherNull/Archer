<!--
 * @Author: Null
 * @Date: 2022-10-09 13:52:26
 * @Description: 工作台
-->
<template>
  <div class="Workbench">
    <HeaderBox ref="headerBox" title="工作台文字123" likes="fish is you" @refresh="refresh"></HeaderBox>

    <el-button @click="click">点击</el-button>

    <el-button @click="alertMsg1">点击1</el-button>

    <el-button @click="alertMsg2">点击2</el-button>

    <el-button @click="alertMsg3">点击3</el-button>
  </div>
</template>

<!-- eslint-disable no-unused-vars -->
<script setup>
import { ref } from 'vue'
import HeaderBox from './components/HeaderBox.vue'
import { showMessage } from '@/common/index'
import { ElMessage } from 'element-plus'

const headerBox = ref(null)

const refresh = () => {
  console.log('父页面刷新')
}

const click = () => {
  headerBox.value.handleNodeClick()
}

const alertMsg1 = () => {
  showMessage('提示')
}

const alertMsg2 = () => {
  showMessage({
    message: '测试',
    type: 'error',
    showClose: true,
    duration: 2000
  })
}

const alertMsg3 = () => {
  const handleCancelRequestFun = () => {
    setTimeout(() => {
      ElMessage.closeAll()
    }, 2000)
  }
  window.handleCancelRequestFun = handleCancelRequestFun

  const timeout = 10000
  const handleTime = 5000
  showMessage({
    dangerouslyUseHTMLString: true,
    type: 'warning',
    duration: handleTime,
    showClose: true,
    message: `<span>手动取消请求在${timeout - handleTime}ms内,可<button style="margin:0 6px;color:blue;" onClick="handleCancelRequestFun()">手动取消</button></span>`
  })
}
</script>
