<!--
 * @Author: Null
 * @Date: 2021-12-06 10:29:08
 * @Description: 字段设置-- 自定义字段
-->

<template>
  <div class="FieldsSet" title="字段设置">
    <a-popover
      placement="top"
      v-model="visible"
      title="字段设置"
      trigger="click"
      @visibleChange="handleClickChange"
    >
      <template slot="content">
        <div class="FieldsCheck">
          <div
            v-if="initColumnDefs.sortabledFields.length"
            :id="`sortable-${fieldsSetId}`"
            class="fields"
          >
            <div
              v-for="(item, index) in initColumnDefs.sortabledFields"
              :key="item.headerName"
              class="fields-item flex-censta"
            >
              <div class="fields-item-left" @click.stop="operation(index, 0)">
                <!-- 选中或不选中 -->
                <div
                  :class="[
                    'fields-item-left-check',
                    !item.hide ? 'checked' : 'unchecked',
                  ]"
                />

                <span
                  class="fields-item-left-itemText ellipsis"
                  :title="item.headerName"
                >{{ item.headerName }}</span>
              </div>
              <!-- 冻结列 -->
              <div
                title="固定列"
                :class="[
                  item.pinned === 'left' ? 'pinnedLeft' : 'pinnedNone',
                  'pinnedBox',
                ]"
                @click="operation(index, 2)"
              >
                <img
                  class="svg-img svg-img-pinned"
                  v-if="item.pinned === 'left'"
                  src="./svg/pinned.svg"
                />
                <img class="svg-img svg-img-noPinned" v-else src="./svg/no-pinned.svg" />
              </div>

              <div v-show="item.isNew" :class="[item.isNew ? 'fields-item-left-new' : '']">New</div>
            </div>
          </div>
          <div v-else class="flex-cencen noMoreData">暂无数据</div>
        </div>
        <div class="btnBox">
          <div class="btnBox_left">
            <!-- <a-checkbox @change="selectedAll">全选</a-checkbox> -->
            <a href="javascript:;" @click="resetSelectedAll">重置</a>
          </div>
          <div class="btnBox_right">
            <a-button size="small" @click="visible = false">取消</a-button>
            <a-button
              size="small"
              type="primary"
              :loading="submitLoading"
              @click="submitFieldsSet"
            >确定</a-button>
          </div>
        </div>
      </template>
      <a-button>
        <a-icon type="setting" />
      </a-button>
    </a-popover>
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import { deepClone } from '@/utils/util'

export default {
  name: 'FieldsSet', // 字段设置-- 自定义字段
  props: {
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
    }
  },
  data() {
    return {
      visible: false,
      filesList: [],
      transformIndexObj: [],
      sortable: null,
      submitLoading: false
    }
  },
  methods: {
    // popover 显隐
    handleClickChange(ele) {
      if (ele) {
        !this.sortable && this.initSort()
        if (this.fieldsCheckList && this.fieldsCheckList.length) {
          this.initColumnDefs.sortabledFields = deepClone(this.fieldsCheckList)
        }
      }
    },
    // 字段操作
    operation(index, type) {
      if (type === 0) {
        this.initColumnDefs.sortabledFields[index].hide = !this.initColumnDefs.sortabledFields[index].hide
      } else if (type === 2) {
        this.initColumnDefs.sortabledFields[index].pinned =
          this.initColumnDefs.sortabledFields[index].pinned === 'left' ? 'none' : 'left'
      }
    },
    // 初始化排序
    initSort() {
      const that = this
      that.$nextTick(() => {
        const el = document.getElementById(`sortable-${this.fieldsSetId}`)
        if (el) {
          const sortable = new Sortable(el, {
            onEnd: evt => {
              console.log('evt', evt)
              const { oldIndex, newIndex } = evt
              console.log('[oldIndex, newIndex]', [oldIndex, newIndex])

              const moveItem = that.initColumnDefs.sortabledFields.splice(oldIndex, 1)
              console.log('moveItem', moveItem[0].headerName)
              that.initColumnDefs.sortabledFields.splice(newIndex, 0, moveItem[0])
            }
          })
          this.sortable = sortable
        }
      })
    },
    // 全选
    selectedAll(ele) {
      console.log('全选', ele)
    },

    // 重置
    resetSelectedAll() {
      console.log('重置')
      this.saveFieldsAjax()
    },
    // 提交字段设置
    submitFieldsSet() {
      console.log('提交字段设置', this.initColumnDefs.sortabledFields)
      this.saveFieldsAjax(this.initColumnDefs.sortabledFields)
    },

    // 保存字段接口
    saveFieldsAjax(jsonStr) {
      if (
        this.initColumnDefs.addOrEditServerFieldsAjax &&
        typeof this.initColumnDefs.addOrEditServerFieldsAjax === 'function'
      ) {
        this.submitLoading = true
        const json = jsonStr ? JSON.stringify(jsonStr) : ''

        const agTableId = this.initColumnDefs.agGridTableId

        console.log('agTableId=====>', agTableId)

        this.initColumnDefs
          .addOrEditServerFieldsAjax(
            {
              fieldJson: json
            },
            agTableId
          )
          .then(res => {
            if (res.code === 200) {
              this.$message.success('保存成功')
              this.$emit('success')
              this.visible = false
            } else {
              this.$message.error(res.message || '保存失败，请联系管理员')
            }
          })
          .finally(() => {
            this.submitLoading = false
          })
      } else {
        this.$message.warning('保存方法丢失，请联系管理员')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.FieldsCheck {
  max-width: 500px;
  min-width: 300px;
  min-height: 60px;
  max-height: 400px;
  overflow-y: scroll;
  box-sizing: border-box;
}
.fields {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 10px;
  row-gap: 5px;
  &-item {
    position: relative;
    display: flex;
    align-items: center;
    &-left {
      flex: 1;
      cursor: pointer;
      font-size: 14px;
      text-align: start;
      display: grid;
      align-items: center;
      grid-template-columns: 18px 1fr;
      margin-right: 4px;
      &-check {
        width: 14px;
        height: 14px;
      }
      &-itemText {
        color: #848484;
      }
    }
    &-right {
      &-cancel {
        cursor: pointer;
      }
    }
  }
}

.unchecked {
  width: 14px;
  height: 14px;
  color: #dcdfe6;
  border: solid 1px #dcdfe6;
  border-radius: 2px;
}
.checked {
  width: 14px;
  height: 14px;
  background-color: #1890ff;
  color: #1890ff;
  border-radius: 2px;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 9px;
    height: 5px;
    display: inline-block;
    border: 1.5px solid #fff;
    border-width: 0 0 1px 1px;
    transform: rotate(-45deg);
    -ms-transform: rotate(-45deg);
    -moz-transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
    -o-transform: rotate(-45deg);
    vertical-align: baseline;
  }
}

.cancel {
  display: inline-block;
  width: 12px;
  height: 2px;
  background: #ff4949;
  line-height: 0;
  font-size: 0;
  vertical-align: middle;
  transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  -o-transform: rotate(45deg);
  &::after {
    content: '/';
    display: block;
    width: 12px;
    height: 2px;
    background: #ff4949;
    transform: rotate(90deg);
    -ms-transform: rotate(90deg);
    -moz-transform: rotate(90deg);
    -webkit-transform: rotate(90deg);
    -o-transform: rotate(90deg);
  }
}
.pinnedBox {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-sizing: border-box;
  &:hover {
    background: rgb(232, 244, 255);
    // color: #1890ff;
  }
}
.pinnedLeft {
  color: #f00;
  border: solid 1px #f00;
}

.pinnedNone {
  border: solid 1px #badeff;
}

.fields-item-left-new {
  font-size: 12px;
  color: #f00;
  font-weight: bold;
  position: absolute;
  top: -3px;
  right: 25px;
  z-index: 1;
}
.flex-cencen {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ellipsis {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.noMoreData {
  color: #999;
  height: 100%;
}

.svg-img {
  width: 16px;
  height: 16px;
  &-pinned {
    color: red;
  }
}

.btnBox {
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  &_left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
  }

  &_right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
  }
}
</style>
