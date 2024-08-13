<!--
 * @Author: Null
 * @Date: 2022-11-03 13:40:37
 * @Description:
-->
<template>
  <div :class="['BLHeaderBox' , hasMarginBottom ?'BLHeaderBox-btm' :'']">
    <div v-if="title" class="BLHeaderBox-top">
      <div class="BLHeaderBox-top-title" :style="{ 'fontSize': fontSize }">
        <div class="BLHeaderBox-top-title-text">{{ title }}</div>

        <div class="BLHeaderBox-top-title-sub">
          <slot name="subTitle" />
        </div>
      </div>
      <div>
        <slot name="right" />
      </div>
    </div>
    <div class="BLHeaderBox-alert">
      <slot name="alert" />
    </div>
    <div
      :class="['BLHeaderBox-content', classType ==='grid3' ?'BLHeaderBox-content-grid3': classType ==='grid2'?'BLHeaderBox-content-grid2':'']"
    >
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'BLHeaderBox',
  props: {
    title: {
      type: String,
      default: ''
    },
    classType: {
      type: String,
      default: ''
    },
    fontSize: {
      type: String,
      default: '14px'
    },
    hasMarginBottom: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="less" scoped>
.BLHeaderBox {
  width: 100%;
  &-btm {
    margin-bottom: 10px;
  }
  &-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    &-title {
      display: flex;
      align-items: stretch;
      justify-content: flex-end;
      height: 33px;
      line-height: 33px;
      box-sizing: border-box;
      &-text {
        font-weight: bold;
        color: #333;
      }
      &-sub {
        color: #999;
        display: inline-block;
        margin-left: 20px;
      }
    }
    &-subTitle {
      font-size: 14px;
      color: #677;
    }
  }

  &-alert {
    position: relative;
    top: -5px;
  }

  &-content {
    padding: 6px;
    width: 100%;
    &-grid2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 10px;
    }
    &-grid3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      column-gap: 10px;
    }
  }
}

::v-deep .BLHeaderBox-content {
  .ant-select {
    min-width: 180px;
  }
}
</style>
