<!--
 * @Author: Null
 * @Date: 2022-01-26 21:16:57
 * @Description: 一级标题组件
-->

<template>
  <div :id="domId" class="FirstTitle-box FirstTitle-box-anchor dk-mb-10">
    <div :class="['FirstTitle', isShowTitleBg ? 'dk-pt-8 dk-pb-8' : 'dk-mb-10']">
      <div class="FirstTitle-left">
        <div class="FirstTitle-left__box">
          <div v-if="isShowTitleBg" :style="{ background: statusBarbg }" class="FirstTitle-left__box_bg dk-mr-8" />
          <div class="FirstTitle-left__box_title dk-f2-title">
            {{ title }}
          </div>
        </div>
        <div class="FirstTitle-left__subBox dk-ml-10">
          <slot name="left" />
        </div>
      </div>
      <div class="FirstTitle-right">
        <slot name="right" />
      </div>
    </div>
    <!-- 内容 -->
    <div :class="['dk-content', isShowTitleBg ? 'dk-p-8' : '']">
      <slot name="content" />
    </div>
  </div>
</template>

<script>
// 一级标题前的色块背景
const titleBgColor = {
  info: '#3898ff',
  success: '#67c23a',
  warning: '#e6a23c',
  danger: '#ff8f8f'
}

export default {
  name: 'FirstTitle',
  props: {
    title: {
      type: String,
      default: '标题'
    },
    // 标题旁的色块颜色，状态标识 ， info普通信息  success成功状态 ， warning 警告状态 ， danger 危险状态
    titleBgStatus: {
      type: String,
      default: ''
    },
    // 色块自定义颜色
    customTitleBg: {
      type: String,
      default: ''
    },
    // 是否展示色块
    isShowTitleBg: {
      type: Boolean,
      default: true
    },
    // 模块定位id
    cDomId: {
      type: String,
      default: ''
    }
  },
  computed: {
    statusBarbg() {
      if (this.isShowTitleBg) {
        if (this.customTitleBg) {
          return this.customTitleBg
        } else {
          return titleBgColor[this.titleBgStatus]
        }
      } else {
        return {}
      }
    },
    // 拼装domId
    domId() {
      const currentPath = this.$router.history.current.path
      if (this.cDomId) {
        return `${currentPath}-${this.cDomId}`
      } else {
        const domId = `${currentPath}:${this.title}`
        // console.log('domId===========>', domId)
        return domId
      }
    }
  }
}
</script>

<style lang="less" scoped>
.FirstTitle-box {
  position: relative;
}
.FirstTitle {
  cursor: pointer;
  width: 100%;
  position: sticky;
  background: #fff;
  top: 0;
  z-index: 10;
  border-bottom: solid 1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;

  &-box {
    margin-bottom: 10px;
  }

  &-left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    &__box {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      &_bg {
        background-color: @primary-color;
        width: 6px;
        height: 18px;
        border-radius: 2px;
      }
    }
  }
}

.dk-mb-10 {
  margin-bottom: 10px;
}
.dk-pt-8 {
  padding-top: 8px;
}
.dk-pb-8 {
  padding-bottom: 8px;
}
.dk-mr-8 {
  margin-right: 8px;
}
.dk-ml-10 {
  margin-left: 10px;
}
.dk-f2-title {
  font-size: 14px;
}

.dk-p-8 {
  padding: 8px;
}
</style>
