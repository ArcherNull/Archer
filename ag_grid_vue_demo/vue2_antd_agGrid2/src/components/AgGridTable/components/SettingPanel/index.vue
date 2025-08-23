<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-08-20 16:40:20
 * @LastEditTime: 2024-12-27 09:14:31
 * @Description:  字段设置-- 自定义字段
-->
<template>
  <span class="FieldsSet" title="设置">
    <a-popover placement="top" v-model="visible" trigger="click" @visibleChange="handleClickChange">
      <template slot="content">
        <span class="FieldsSet-box" v-if="fieldsSetId && fieldsList.length">
          <!-- 导航tab -->
          <a-tabs
            size="small"
            type="card"
            class="FieldsSetTabs"
            @change="changeTab"
            :tabBarStyle="{
              margin: '0px',
            }"
          >
            <a-tab-pane key="fields" tab="字段">
              <FieldsSet
                :fieldsSetId="fieldsSetId"
                :initColumnDefs="initColumnDefs"
                :agTableOptions="agTableOptions"
                @success="successFun"
              ></FieldsSet>
            </a-tab-pane>
            <a-tab-pane key="file" tab="文件" force-render>
              <FileCenter :initColumnDefs="initColumnDefs"></FileCenter>
            </a-tab-pane>
            <a-tab-pane key="print" tab="打印">
              <PrintBox></PrintBox>
            </a-tab-pane>
            <a-tab-pane key="chart" tab="图表">图表</a-tab-pane>
            <a-tab-pane key="config" tab="配置">
              <ConfigBox :agTableOptions="agTableOptions"></ConfigBox>
            </a-tab-pane>
          </a-tabs>

          <!-- 底部统计行 -->
          <div class="FieldsSet-box-footer">
            <StatisticsFooter ref="StatisticsFooterRef" :agTableOptions="agTableOptions"></StatisticsFooter>
          </div>
        </span>
        <DKEmpty v-else></DKEmpty>
      </template>
      <a-button>
        <a-icon type="setting" />
      </a-button>
    </a-popover>
  </span>
</template>

<script>
import Sortable from 'sortablejs'

export default {
  name: 'SettingPanel', // 字段设置-- 自定义字段
  components: {
    FieldsSet: () => import('./components/FieldsSet/index.vue'),
    FileCenter: () => import('./components/FileCenter/index.vue'),
    ConfigBox: () => import('./components/ConfigBox/index.vue'),
    PrintBox: () => import('./components/PrintBox/index.vue'),
    StatisticsFooter: () => import('./components/StatisticsFooter/index.vue'),
    DKEmpty: () => import('./components/DKEmpty/index.vue')
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
  computed: {
    fieldsList() {
      if (this.initColumnDefs && this.initColumnDefs.sortabledFields) {
        return this.initColumnDefs.sortabledFields
      } else {
        return []
      }
    }
  },
  methods: {
    // popover 显隐
    handleClickChange(ele) {
      if (ele) {
        const that = this
        this.$nextTick(() => {
          const { agTableApi } = this.agTableOptions
          that.$refs.StatisticsFooterRef.getStatisticsInfo()
          if (agTableApi) {
            that.agTableOptions.agTableApi.registerUpdateGridDataCalback(() => {
              that.$refs.StatisticsFooterRef.getStatisticsInfo()
            })
          }
        })
      }
    },
    // 获取信息
    getInfo() {
      console.log('this.initColumnDefs', this.initColumnDefs)
      console.log('this.agTableOptions', this.agTableOptions)
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
            onEnd: (evt) => {
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
          .then((res) => {
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
    },

    // 更改tab
    changeTab(ele) {
      console.log('更改tab', ele)
    },
    successFun() {
      this.$emit('success')
    }
  }
}
</script>

<style>
.ant-popover-inner-content {
  padding: 6px 10px;
}
</style>

<style lang="less" scoped>
::v-deep .FieldsSet-popover .ant-popover-content .ant-popover-inner .ant-popover-inner-content {
  padding: 6px 10px !important;
}

::v-deep .FieldsSet .ant-popover-inner-content {
  padding: 6px 10px !important;
}

::v-deep .FieldsSet-box .ant-tabs-bar {
  margin: 0px !important;
}

::v-deep .FieldsSetTabs .ant-tabs-content {
  height: 35vh;
  width: 550px;
  overflow-y: scroll;
}

.FieldsSet-box-footer {
  cursor: pointer;
}
</style>
