<template>
  <div class="User">
    <el-button @click="clickFun()">点击</el-button>
  </div>
</template>

<script setup>
import { ref, reactive, watchEffect } from 'vue'

const modelObj = ref({
  title: '标题',
  content: '内容'
})

let a = ref(true)
let b = ref(false)

watchEffect(() => {
    b.value
  if (a.value || b.value) {
    console.log('依赖收集监听')
  }
})

function clickFun() {
  b.value = !b.value
}
</script>

<style lang="scss" scoped></style>
