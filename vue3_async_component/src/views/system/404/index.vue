<template>
  <div class="Error404-container" flex="main:center cross:center">
    <div class="Error404" flex="main:center ">
      <div class="pic-404">
        <img class="pic-404__parent" src="@/assets/images/404_images/404.png" alt="404" />
        <img class="pic-404__child left" src="@/assets/images/404_images/404_cloud.png" alt="404" />
        <img class="pic-404__child mid" src="@/assets/images/404_images/404_cloud.png" alt="404" />
        <img class="pic-404__child right" src="@/assets/images/404_images/404_cloud.png" alt="404" />
      </div>
      <div class="bullshit">
        <div class="bullshit__oops">页面不存在!</div>
        <div class="bullshit__headline">{{ message }}</div>
        <div class="bullshit__info">将在{{ timeNum }}s后，自动跳转首页...</div>
        <MyButton type="primary" round class="bullshit__return-home" @click="jumpIndexPage()">跳转首页</MyButton>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onBeforeMount, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Error404',

  setup () {
    // 提示
    const message = ref('请检查页面路径是否正确，或者向管理员确认页面是否授权')
    // 定时器
    const interval = ref(null)
    // 定时时长
    const timeNum = ref(15)

    const router = useRouter()

    // 清除定时器
    const clearIntervalFun = () => {
      clearInterval(interval.value)
      interval.value = null
    }

    // 跳转首页
    const jumpIndexPage = () => {
      console.log('跳转首页')
      router.push({
        path: '/index'
      })
    }

    // 倒计时
    const countDownFun = () => {
      interval.value = setInterval(() => {
        if (timeNum.value === 0) {
          clearIntervalFun()
          jumpIndexPage()
          timeNum.value = 0
        }
        timeNum.value--
      }, 1000)
    }

    onBeforeMount(() => {
      countDownFun()
    })

    onBeforeUnmount(() => {
      clearIntervalFun()
    })

    return {
      message,
      interval,
      timeNum,
      countDownFun,
      jumpIndexPage
    }
  }
}
</script>

<style lang="scss" scoped>
.Error404-container {
  height: calc(100vh - 110px);
  width: 100%;
}
.Error404 {
  position: relative;
  padding: 0 50px;
  overflow: hidden;

  .pic-404 {
    position: relative;
    float: left;
    width: 600px;
    overflow: hidden;
    &__parent {
      width: 100%;
    }
    &__child {
      position: absolute;
      &.left {
        width: 80px;
        top: 17px;
        left: 220px;
        opacity: 0;
        animation-name: cloudLeft;
        animation-duration: 2s;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
        animation-delay: 1s;
      }
      &.mid {
        width: 46px;
        top: 10px;
        left: 420px;
        opacity: 0;
        animation-name: cloudMid;
        animation-duration: 2s;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
        animation-delay: 1.2s;
      }
      &.right {
        width: 62px;
        top: 100px;
        left: 500px;
        opacity: 0;
        animation-name: cloudRight;
        animation-duration: 2s;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
        animation-delay: 1s;
      }
      @keyframes cloudLeft {
        0% {
          top: 17px;
          left: 220px;
          opacity: 0;
        }
        20% {
          top: 33px;
          left: 188px;
          opacity: 1;
        }
        80% {
          top: 81px;
          left: 92px;
          opacity: 1;
        }
        100% {
          top: 97px;
          left: 60px;
          opacity: 0;
        }
      }
      @keyframes cloudMid {
        0% {
          top: 10px;
          left: 420px;
          opacity: 0;
        }
        20% {
          top: 40px;
          left: 360px;
          opacity: 1;
        }
        70% {
          top: 130px;
          left: 180px;
          opacity: 1;
        }
        100% {
          top: 160px;
          left: 120px;
          opacity: 0;
        }
      }
      @keyframes cloudRight {
        0% {
          top: 100px;
          left: 500px;
          opacity: 0;
        }
        20% {
          top: 120px;
          left: 460px;
          opacity: 1;
        }
        80% {
          top: 180px;
          left: 340px;
          opacity: 1;
        }
        100% {
          top: 200px;
          left: 300px;
          opacity: 0;
        }
      }
    }
  }
  .bullshit {
    position: relative;
    float: left;
    width: 300px;
    padding: 30px 0;
    overflow: hidden;
    &__oops {
      font-size: 32px;
      font-weight: bold;
      line-height: 40px;
      color: #1482f0;
      opacity: 0;
      margin-bottom: 20px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-fill-mode: forwards;
    }
    &__headline {
      font-size: 20px;
      line-height: 24px;
      color: #222;
      font-weight: bold;
      opacity: 0;
      margin-bottom: 10px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.1s;
      animation-fill-mode: forwards;
    }
    &__info {
      font-size: 13px;
      line-height: 21px;
      color: grey;
      opacity: 0;
      margin-bottom: 30px;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.2s;
      animation-fill-mode: forwards;
    }
    &__return-home {
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.3s;
      animation-fill-mode: forwards;
    }
    @keyframes slideUp {
      0% {
        transform: translateY(60px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }
  }
}
</style>
