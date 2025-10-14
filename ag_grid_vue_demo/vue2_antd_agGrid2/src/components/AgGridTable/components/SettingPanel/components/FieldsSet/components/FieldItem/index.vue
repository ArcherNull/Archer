<!--
 * @Author: Null
 * @Date: 2022-11-14 13:41:52
 * @Description:
-->
<template>
  <div class="FieldItemBox">
    <div class="FieldItem" v-if="newSortabledFields && newSortabledFields.length" >
      <span v-for="(fieldItem, index) in newSortabledFields" :key="index" class="FieldItem-content">
        <span class="FieldItem-content-index">{{ index + 1 }}</span>
        <!-- <a-checkbox v-model="fieldItem.hide" /> -->
        <a-checkbox :checked="!fieldItem.hide" @change="changeChecked(fieldItem)" />

        <a-input
          v-model="fieldItem.headerName"
          size="small"
          class="FieldItem-input"
          :placeholder="fieldItem.name"
          :clearable="clearable"
          :disabled="disabled"
          :maxLength="20"
          title="请输入自定义字段名"
          @blur="validateHeaderName($event, fieldItem)"
        />
        <a-input-number
          v-model="fieldItem.width"
          :maxLength="3"
          :max="agMaxWidth"
          :min="agMinWidth"
          :precision="0"
          size="small"
          class="FieldItem-width"
          placeholder="宽度"
          :clearable="clearable"
          :disabled="disabled"
          title="请输入自定义宽度"
        />
        <PinnedBox v-model="fieldItem.pinned" @change="changePinned($event, fieldItem, index)" />
        <FilterBox v-model="fieldItem.filter" @change="changeFilter($event, fieldItem, index)" />
        <!-- <EditableBox v-model="fieldItem.editable" @change="changeEditable($event, fieldItem, index)" /> -->
        <SortableBox v-model="fieldItem.sortable" @change="changeSortable($event, fieldItem, index)" />
        <CalculatorBox v-model="fieldItem.computable" @change="changeCalculator($event, fieldItem, index)" />
      </span>
    </div>
    <DKEmpty v-else></DKEmpty>
  </div>
</template>

<script>
import { AG_GRID_DEFCOL_MIN_WIDTH, AG_GRID_DEFCOL_MAX_WIDTH } from '@/components/AgGridTable/common/agGrid-config.js'
export default {
  name: 'FieldItem',
  components: {
    PinnedBox: () => import('../PinnedBox/index.vue'),
    FilterBox: () => import('../FilterBox/index.vue'),
    EditableBox: () => import('../EditableBox/index.vue'),
    SortableBox: () => import('../SortableBox/index.vue'),
    CalculatorBox: () => import('../CalculatorBox/index.vue'),
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
      disabled: false,
      clearable: false,
      agMinWidth: AG_GRID_DEFCOL_MIN_WIDTH,
      agMaxWidth: AG_GRID_DEFCOL_MAX_WIDTH
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
    // 校验
    validateHeaderName(ele, fieldItem) {
      const val = ele.target.value
      if (val) {
        const isExist = this.initColumnDefs.currentFields.find((item) => item.headerName === val)
        if (isExist && val !== fieldItem.name) {
          this.$message.warning(`【${val}】已被命名，请重新命名`)
          fieldItem.headerName = fieldItem.name
        }
      } else {
        fieldItem.headerName = fieldItem.name
        this.$message.warning('不能为空')
      }
    },
    // 显隐
    changeChecked(fieldItem) {
      fieldItem.hide = !fieldItem.hide
    },
    // 改变固定列
    changePinned(ele, fieldItem, index) {
      console.log('改变固定列', ele)
      fieldItem.pinned = ele === 'left' ? '' : 'left'
    },
    // 改变固定列
    changeFilter(ele, fieldItem, index) {
      console.log('改变固定列', ele)
      fieldItem.filter = !ele
    },
    // 改变可编辑
    changeEditable(ele, fieldItem, index) {
      console.log('改变可编辑', ele)
      fieldItem.editable = !ele
    },
    // 改变可排序
    changeSortable(ele, fieldItem, index) {
      console.log('改变可排序', ele)
      fieldItem.sortable = !ele
    },

    // 改变可计算
    changeCalculator(ele, fieldItem, index) {
      console.log('改变可计算', ele)
      fieldItem.computable = !ele
    }
  }
}
</script>

<style lang="less" scoped>
.FieldItem {
  &-content {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 6px;

    &-index {
      margin-right: 6px;
    }
  }
  &-input,
  &-width,
  div {
    margin-left: 4px;
  }
  &-input {
    width: 120px;
  }
  &-width {
    width: 80px;
  }
}
</style>
