<template>
  <div class="User">
    <h5>子组件标题</h5>
    <el-input v-model="model.title" placeholder="请输入"></el-input>
    <h5>子组件内容</h5>
    <el-input v-model="model.content" placeholder="请输入"></el-input>
  </div>
</template>

<script setup>
import { defineProps, computed, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits('update:modelValue')

const model = computed({
  get() {
    // 如果props.modelValue是对象，需要使用Proxy代理
    const proxy = new Proxy(props.modelValue, {
      get(target, key) {
        return Reflect.get(target, key)
      },
      set(target, key, value) {
        Reflect.set(target, key, value)
        emit('update:modelValue', target)
        return true
      }
    })
    return proxy
  },
  set(val) {
    emit('update:modelValue', val)
  }
})
</script>

<style lang="scss" scoped>
.User {
  border: solid 1px #f00;
  padding: 10px;
}
</style>
