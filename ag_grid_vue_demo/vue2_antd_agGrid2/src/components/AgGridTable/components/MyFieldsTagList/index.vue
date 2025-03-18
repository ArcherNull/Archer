<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-01-25 16:10:23
 * @LastEditTime: 2024-01-27 11:55:09
 * @Description:
-->
<template>
  <div v-show="Object.keys(tagsObj || {}).length" class="myFieldsTagList-content">
    <a-tag
      v-for="(item, index) in Object.keys(tagsObj)"
      :key="index"
      color="green"
      closable
      @close="closeTag(item)"
    >{{ item | getTagStr }}:{{ tagsObj[item] }}</a-tag>
  </div>
</template>

<script>
export default {
  name: 'MyFieldsTagList',
  filters: {
    getTagStr(str) {
      return str.split('|')[0]
    }
  },
  props: {
    // 标签列表
    tagsObj: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  methods: {
    // 关闭标签
    closeTag(item) {
      console.log('关闭标签', item)
      this.$emit('closeTag', item)
    }
  }
}
</script>

<style lang="less" scoped>
.myFieldsTagList-content {
  flex: 1;
  height: 32px;
  overflow-x: hidden;
  overflow-y: scroll;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  background-color: #ffd591;
  padding: 0 6px;
  cursor: pointer;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
