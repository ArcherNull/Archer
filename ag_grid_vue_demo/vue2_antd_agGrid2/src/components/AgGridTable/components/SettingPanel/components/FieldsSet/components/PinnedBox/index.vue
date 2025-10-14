<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-02 10:11:34
 * @LastEditTime: 2024-09-02 11:08:33
 * @Description:
-->
<template>
  <!-- 冻结列 -->
  <div
    title="于左侧冻结列"
    :class="[pinned === 'left' ? 'pinnedLeft' : 'pinnedNone', 'pinnedBox']"
    @click.stop="clickFun(pinned)"
  >
    <a-icon type="pushpin" :class="[pinned === 'left' ? 'pinned' : 'no-pinned']" />
  </div>
</template>

<script>
export default {
  name: 'PinnedBox',
  model: {
    prop: 'pinned',
    event: 'update'
  },
  props: {
    pinned: {
      type: String,
      default: ''
    }
  },
  methods: {
    clickFun(ele) {
      console.log('点击', ele)
      this.$emit('change', ele)
    }
  }
}
</script>

<style lang="less" scoped>
.pinnedBox {
  cursor: pointer;
  box-sizing: border-box;
  font-size: 18px;

  &:hover {
    background: rgb(232, 244, 255);
  }
}
.pinnedLeft {
  // border: solid 1px #f00;
}

.pinnedNone {
  // border: solid 1px #badeff;
}
.pinned {
  color: #f00;
}
.no-pinned {
  color: #c0c0c0;
}
</style>
