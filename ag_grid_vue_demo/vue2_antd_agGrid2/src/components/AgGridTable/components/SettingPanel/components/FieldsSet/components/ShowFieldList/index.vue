<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-06 14:15:27
 * @LastEditTime: 2024-09-06 14:35:46
 * @Description:
-->
<template>
  <div class="showFieldList">
    <div v-if="fieldList.length">
      <div class="header">
        <a-input v-model="searchValue" size="small" placeholder="请输入搜索文本" />
      </div>
      <div class="showFieldList-box">
        <div class="contentItem" :title="fieldItem.headerName" v-for="(fieldItem, index) in newFieldList" :key="index">
          <div class="ellipsis" @click="selectedItem(fieldItem)">
            {{ fieldItem.headerName }}
          </div>
        </div>
      </div>
    </div>
    <DKEmpty v-else></DKEmpty>
  </div>
</template>

<script>
export default {
  name: 'ShowFieldList',
  components: {
    DKEmpty: () => import('../../../DKEmpty/index.vue')
  },
  props: {
    fieldList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      searchValue: ''
    }
  },
  computed: {
    newFieldList() {
      if (this.searchValue) {
        return this.fieldList.filter((ele) => ele.headerName.indexOf(this.searchValue) !== -1)
      } else {
        return this.fieldList
      }
    }
  },
  methods: {
    selectedItem(item) {
      console.log('selectedItem', item)
      this.$emit('selected', item)
    }
  }
}
</script>

<style lang="less" scoped>
.showFieldList {
  height: 150px;
  min-width: 200px;
  overflow-y: scroll;

  .header {
    margin-bottom: 10px;
    margin-right: 10px;
    position: sticky;
    top: 0px;
  }

  &-box {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
  }

  .contentItem {
    width: 100px;
    cursor: pointer;
  }
}
</style>
