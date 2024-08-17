<!--
 * @Author: Null
 * @Date: 2022-08-23 18:30:22
 * @Description: 首页
-->

<template>
  <div class="Index">
    <MyButton :loading="loading" @clickFun="clickBtn"></MyButton>

    <MyCustomer></MyCustomer>

    {{ store.count }}
    <el-button @click="clickCount()"> 按钮 </el-button>

    <LoadMore></LoadMore>

  </div>
</template>

<script>
import { ref } from 'vue'
import { useCounterStore } from '@/store/element/elButton.js'

export default {
  name: 'Index',
  setup () {
    // 按钮loading
    const loading = ref(false)

    const store = useCounterStore()

    const clickCount = () => {
      console.log('点击计数')
      store.count++
    }

    const clickBtn = (ele) => {
      loading.value = true
      setTimeout(() => {
        console.log('点击按钮=====>', ele)
        loading.value = false
      }, 2000)
    }

    return {
      loading,
      store,
      clickBtn,
      clickCount
    }
  }
}
</script>

<style lang="scss" scoped>
.Index {
  height: 250vh;
}
</style>
