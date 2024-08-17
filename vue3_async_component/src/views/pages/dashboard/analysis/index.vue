<!--
 * @Author: Null
 * @Date: 2022-10-09 13:52:26
 * @Description: 分析页
-->
<template>
  <div class="Analysis">
    {{ title }}

    <div flex>
      <MyLottie></MyLottie>

      <MyLottie :src="Loading1"></MyLottie>

      <div>
        <MyLottie lottie-type="Loading2" @getAnimation="getAnimation"></MyLottie>
        <span v-if="state.anim">
          <el-button @click="state.anim.play()">播放</el-button>
          <el-button @click="state.anim.stop()">停止</el-button>
          <el-button @click="state.anim.pause()">暂停</el-button>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue'
import Loading1 from '@/components/MyLottie/lottieModel/loading1.json'

export default {
  name: 'Analysis',
  setup () {
    const title = ref('测试刷新')
    const loadingType = ref('loading4')
    const state = reactive({
      anim: null
    })

    onMounted(() => {
      setTimeout(() => {
        title.value = '测试测试测试测试测试测试测试刷新'
      }, 3000)
    })

    const getAnimation = anim => {
      state.anim = anim
    }

    return {
      title,
      getAnimation,
      state,
      loadingType,
      Loading1
    }
  }
}
</script>
