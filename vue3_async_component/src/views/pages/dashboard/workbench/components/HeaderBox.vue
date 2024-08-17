<!--
 * @Author: Null
 * @Date: 2022-10-21 14:16:23
 * @Description: 测试组件
-->
<template>
  <div>
    <div>{{ title }}</div>
    <div>{{ likes }}</div>
    <el-button @click="render">执行渲染</el-button>
  </div>
</template>

<!-- eslint-disable no-unused-vars -->
<script setup>
import {
  onMounted,
  nextTick,
  defineEmits,
  defineProps,
  defineExpose
} from 'vue'

const props = defineProps({
  title: String,
  likes: [Number, String]
})

const handleNodeClick = () => {
  console.log('要执行的方法,可以通过ref调用')
}

// 将方法暴露出去
defineExpose({ handleNodeClick })

const emit = defineEmits(['refresh'])

onMounted(() => {
  console.log('渲染======>', props.title)
})

const render = () => {
  console.log('执行渲染')
  nextTick(() => {
    console.log('执行渲染123')
    emit('refresh', true)
  })
}
</script>
