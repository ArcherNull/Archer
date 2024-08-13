<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-01-30 16:05:28
 * @LastEditTime: 2024-05-14 09:21:53
 * @Description:
-->
<template>
  <a-modal v-bind="customizedAttrs" v-on="$listeners">
    <div v-if="customizedAttrs.contentLoadingStatus === 'success'">
      <slot></slot>
    </div>
    <div
      v-else-if="customizedAttrs.contentLoadingStatus === 'loading'"
      class="BLModal_content"
      v-myLoading="true"
    >
      加载中，请稍后...
    </div>
    <div
      v-else-if="customizedAttrs.contentLoadingStatus === 'empty'"
      class="BLModal_content"
    >
      <a-empty />
    </div>
    <div
      v-else-if="customizedAttrs.contentLoadingStatus === 'error'"
      class="BLModal_content"
    >
      <a-result status="error" title="异常错误" sub-title="请联系管理员处理">
      </a-result>
    </div>

    <template slot="title">
      <span class="BLModal_title">
        <span class="BLModal_title_left">
          <slot name="title">{{ $attrs.title }}</slot>
        </span>
        <a-icon
          v-if="customizedAttrs.isShowFullScreenBtn"
          @click="toggleFullscreen"
          class="BLModal_title_right"
          :type="fullscreenButtonIcon"
        />
      </span>
    </template>

    <template slot="footer">
      <slot name="footer"></slot>
    </template>
  </a-modal>
</template>

<script>
export default {
  name: "BLModal",
  // 不希望组件的根元素继承特性
  inheritAttrs: false,
  data() {
    return {
      // 全屏状态
      isFullScreen: false,
      // 全屏样式
      fullScreenStyle: {
        bodyStyle: {
          padding: "10px 16px",
          height: "calc(100vh - 108px)",
          overflowY: "scroll",
          boxSizing: "border-box",
        },
        width: "100vw",
        dialogStyle: {
          top: "0px",
          paddingBottom: "0px",
        },
      },
    };
  },
  computed: {
    // 切换全屏的按钮图标
    fullscreenButtonIcon() {
      return this.isFullScreen ? "fullscreen-exit" : "fullscreen";
    },
    customizedAttrs() {
      const obj = {
        bodyStyle: {
          padding: "10px 16px",
          maxHeight: "calc(100vh - 300px)",
          overflowY: "scroll",
        },
        width: "80%",
        // 是否展示全屏按钮
        isShowFullScreenBtn: true,
        // 弹窗内容contentLoadingStatus , success 加载成功， loading 加载中，empty 数据为空，error 错误
        contentLoadingStatus: "success",
      };

      const {
        bodyStyle,
        class: className,
        dialogStyle = {},
        // eslint-disable-next-line no-unused-vars
        style,
        // eslint-disable-next-line no-unused-vars
        title,
        ...resetObj
      } = this.$attrs;

      if (!className) {
        obj.class = "BLModal";
      }

      let newBodyStyle = {
        ...obj.bodyStyle,
        ...(bodyStyle || {}),
      };

      let newDialogStyle = dialogStyle;

      if (this.isFullScreen) {
        resetObj.width = this.fullScreenStyle.width;
        newBodyStyle = this.fullScreenStyle.bodyStyle;
        newDialogStyle = this.fullScreenStyle.dialogStyle;
      }

      const data = Object.assign(obj, {
        ...resetObj,
        "dialog-style": newDialogStyle,
        bodyStyle: newBodyStyle,
      });
      
      return data;
    },
  },
  methods: {
    toggleFullscreen() {
      this.isFullScreen = !this.isFullScreen;
    },
  },
};
</script>

<style lang="less">
.BLModal {
  &_title {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    box-sizing: border-box;
    &_left {
      flex: 1;
    }
    &_right {
      height: 100%;
      position: relative;
      margin-right: 40px;
      font-size: 20px;
      color: @primary-color;
      cursor: pointer;
      user-select: none;
    }
  }

  &_content {
    min-height: 150px;
  }
}
</style>
