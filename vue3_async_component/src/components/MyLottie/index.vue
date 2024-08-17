<!--
 * @Author: Null
 * @Date: 2022-10-20 08:59:07
 * @Description:
 * 参考地址：https://www.jianshu.com/p/6341b0821798
-->
<template>
  <div class="MyLottie">
    <div ref="myLottieContainer"></div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import lottie from 'lottie-web'
import { isEmpty, isObject } from 'lodash-es'

import Loading0 from './lottieModel/loading0.json'
import Loading1 from './lottieModel/loading1.json'
import Loading2 from './lottieModel/loading2.json'
import Loading3 from './lottieModel/loading3.json'
import Loading4 from './lottieModel/loading4.json'

export default {
  name: 'MyLottie',
  props: {
    lottieType: {
      type: String,
      default: 'Loading4'
    },
    // 是否自动循环
    loop: {
      type: Boolean,
      default: true
    },
    // 是否自动播放
    autoplay: {
      type: Boolean,
      default: Boolean
    },
    // 网络路径
    path: {
      type: String,
      default: ''
    },
    // src,本地路径的json文件的引用，本地路径json文件大于网络路径
    src: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  setup (props, context) {
    const myLottieContainer = ref(null)

    // 判断动画json文件
    const judgeLottieType = (type) => {
      return {
        Loading0,
        Loading1,
        Loading2,
        Loading3,
        Loading4
      }[type]
    }

    const renderAnimation = () => {
      if (myLottieContainer.value) {
        // 如果存在引入本地json文件
        const animationObj = {
          container: myLottieContainer.value,
          renderer: 'svg', // 渲染方式:svg：支持交互、不会失帧、canvas、html：支持3D，支持交互
          loop: props.loop, // 循环播放，默认：true
          autoplay: props.autoplay, // 自动播放 ，默认true
          path: props.path // 网络路径
        }

        if (isObject(props.src) && !isEmpty(props.src)) {
          animationObj.animationData = props.src // 本地路径，优先级更高
        } else if (props.lottieType) {
          animationObj.animationData = judgeLottieType(props.lottieType)
        } else {
          animationObj.animationData = Loading0
        }

        const animation = lottie.loadAnimation(animationObj)
        // 将动画对象实例发送给父页面，父页面进行接受
        context.emit('getAnimation', animation)
      }
    }

    onMounted(() => {
      renderAnimation()
    })

    return {
      myLottieContainer
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.MyLottie {
  width: 200px;
  height: 200px;
}
</style>
