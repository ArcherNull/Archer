<!--
 * @Author: Null
 * @Date: 2022-11-14 17:25:28
 * @Description:
-->
<template>
  <div>
    <div v-if="newSortabledFields && newSortabledFields.length" :id="`${sortKey}-${fieldsSetId}`" class="SimpleField">
      <div v-for="fieldItem in newSortabledFields" :key="`${sortKey}-${fieldItem.headerName}`" class="SimpleField-item">
        <div class="SimpleField-item__left" :title="fieldItem.headerName">
          <a-checkbox :checked="!fieldItem.hide" @change="selectedItem(fieldItem)" />
          <div class="SimpleField-item__left-text ellipsis" @click="selectedItem(fieldItem)">
            {{ fieldItem.headerName }}
          </div>
        </div>
        <div class="SimpleField-item__right">
          <PinnedBox v-model="fieldItem.pinned" @change="changePinned($event, fieldItem)" />
          <ColumnJumpBox :item="fieldItem" @clickFun="columnJump" v-if="!fieldItem.hide" />
        </div>
      </div>
    </div>
    <DKEmpty v-else></DKEmpty>
  </div>
</template>

<script>
import Sortable from 'sortablejs'

export default {
  name: 'SimpleField',
  components: {
    PinnedBox: () => import('../PinnedBox/index.vue'),
    ColumnJumpBox: () => import('../ColumnJumpBox/index.vue'),
    DKEmpty: () => import('../../../DKEmpty/index.vue')
  },
  props: {
    agTableOptions: {
      type: Object,
      default: () => {}
    },
    // 表头实例
    initColumnDefs: {
      type: [Object, null],
      default: () => {
        return {}
      }
    },
    fieldsSetId: {
      type: String,
      default: ''
    },
    filterKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      sortable: null,
      sortKey: 'simpleField',
      filterVal: ''
    }
  },
  created() {
    const { sortabledFields } = this.initColumnDefs
    if (sortabledFields && sortabledFields.length) {
      !this.sortable && this.initSort()
    }
  },
  computed: {
    newSortabledFields() {
      const { sortabledFields } = this.initColumnDefs
      if (this.filterKey) {
        return sortabledFields.filter((item) => item.headerName.indexOf(this.filterKey) !== -1)
      } else {
        return sortabledFields
      }
    }
  },
  methods: {
    selectedItem(item) {
      console.log('点击', item)
      item.hide = !item.hide
    },
    changePinned(ele, fieldItem) {
      fieldItem.pinned = ele === 'left' ? '' : 'left'
    },
    // 初始化排序
    initSort() {
      const that = this
      that.$nextTick(() => {
        const el = document.getElementById(`${this.sortKey}-${this.fieldsSetId}`)
        if (el) {
          const sortable = new Sortable(el, {
            onEnd: (evt) => {
              const { oldIndex, newIndex } = evt
              const moveItem = that.initColumnDefs.sortabledFields.splice(oldIndex, 1)
              setTimeout(() => {
                console.log('moveItem', moveItem[0].headerName)
                that.initColumnDefs.sortabledFields.splice(newIndex, 0, moveItem[0])
              })
            }
          })
          this.sortable = sortable
        }
      })
    },
    // 列跳转
    columnJump(ele) {
      console.log('列跳转', ele)
      const { agTableApi } = this.agTableOptions
      if (agTableApi && agTableApi.colPosition) {
        if (agTableApi.colPosition) {
          const colIndex = this.agTableOptions.agTableApi.colPosition(ele)
          if (agTableApi.jumpToCol) {
            this.agTableOptions.agTableApi.jumpToCol(colIndex)
          }
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.SimpleField {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 10px;
  row-gap: 5px;
  &-item {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    cursor: pointer;
    &__left {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      &-text {
        margin-left: 6px;
        width: 100px;
      }
    }
    &__right {
      margin-right: 6px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
    }
  }
}
</style>
