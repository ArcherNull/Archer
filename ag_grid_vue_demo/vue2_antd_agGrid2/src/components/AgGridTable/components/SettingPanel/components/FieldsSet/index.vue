<template>
  <div class="FieldsSet">
    <div v-if="initColumnDefs.sortabledFields && initColumnDefs.sortabledFields.length">
      <FirstTitle :title="`字段设置[${initColumnDefs.sortabledFields.length}]`">
        <div slot="left" class="FieldsSet-header">
          <span v-if="fieldsInfoObj.selected">
            <a-popover title="显示字段" placement="top">
              <template slot="content">
                <ShowFieldList :fieldList="fieldsInfoObj.selected" @selected="selectedField"></ShowFieldList>
              </template>
              <span>
                {{ fieldsInfoObj.selected.length }}
              </span>
            </a-popover>
            -
            <a-popover title="隐藏字段" placement="top">
              <template slot="content">
                <ShowFieldList :fieldList="fieldsInfoObj.unSelected" @selected="selectedField"></ShowFieldList>
              </template>
              <span>
                {{ fieldsInfoObj.unSelected.length }}
              </span>
            </a-popover>
          </span>
          <DKBtnList :btn-list-config="btnListConfig" @clickFun="clickFun" />
        </div>
        <data slot="right">
          <a-input v-model="searchValue" size="small" placeholder="请输入搜索文本" style="width: 150px; margin-right: 6px" />
        </data>
        <div slot="content">
          <div class="FieldsSet-content">
            <div v-if="fieldsMode === '标准版'">
              <SimpleField
                :initColumnDefs="initColumnDefs"
                :agTableOptions="agTableOptions"
                :filterKey="searchValue"
                :fieldsSetId="fieldsSetId"
              />
            </div>
            <div v-else>
              <FieldItem
                :initColumnDefs="initColumnDefs"
                :agTableOptions="agTableOptions"
                :filterKey="searchValue"
                :fieldsSetId="fieldsSetId"
              />
            </div>
          </div>
        </div>
      </FirstTitle>

      <FirstTitle title="条件设置">
        <div slot="left">
          <DKBtnList :btn-list-config="conBtnListConfig" @clickFun="clickFun" />
        </div>
        <div slot="content">
          <div class="FieldsSet-content">
            <!-- <FieldItem :fields-list="fieldsList" /> -->
          </div>
        </div>
      </FirstTitle>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FieldsSet',
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
  components: {
    FirstTitle: () => import('../FirstTitle/index.vue'),
    DKBtnList: () => import('../DKBtnList/index.vue'),
    DKEmpty: () => import('../DKEmpty/index.vue'),
    ShowFieldList: () => import('./components/ShowFieldList/index.vue'),
    FieldItem: () => import('./components/FieldItem/index.vue'),
    SimpleField: () => import('./components/SimpleField/index.vue')
  },
  data() {
    return {
      searchValue: '',
      fieldsMode: '标准版',
      btnListConfig: {
        config: {
          size: 'small'
        },
        schemas: [
          {
            type: 'link',
            btnText: '标准版'
          },
          {
            type: 'primary',
            btnText: '保存'
          },
          {
            type: 'info',
            btnText: '重置',
            plain: true
          }
        ]
      },
      conBtnListConfig: {
        config: {
          size: 'small'
        },
        schemas: [
          {
            type: 'primary',
            btnText: '保存'
          },
          {
            type: 'info',
            btnText: '重置',
            plain: true
          }
        ]
      }
    }
  },
  computed: {
    fieldsInfoObj() {
      const { sortabledFields } = this.initColumnDefs
      const slectedObj = {
        selected: [],
        unSelected: []
      }
      if (Array.isArray(sortabledFields) && sortabledFields.length) {
        sortabledFields.forEach((ele) => {
          if (ele.hide) {
            slectedObj.unSelected.push(ele)
          } else {
            slectedObj.selected.push(ele)
          }
        })
      }
      return slectedObj
    }
  },
  methods: {
    clickFun(data) {
      const { item } = data
      switch (item.btnText) {
        case '标准版':
          this.fieldsMode = '简易版'
          item.btnText = '简易版'
          break
        case '简易版':
          this.fieldsMode = '标准版'
          item.btnText = '标准版'
          break
        case '保存':
          console.log('保存', this.initColumnDefs.sortabledFields)
          item.loading = true
          this.saveFieldsAjax(this.initColumnDefs.sortabledFields, (status) => {
            item.loading = false
            if (status === 'success') {
              console.log('提交123123')
            }
          })
          break
        case '重置':
          console.log('重置')
          this.resetSelectedAll()
          break
      }
    },

    // 重置
    resetSelectedAll() {
      console.log('重置')
      this.saveFieldsAjax()
    },
    // 保存字段接口
    saveFieldsAjax(jsonStr, callback) {
      if (
        this.initColumnDefs.addOrEditServerFieldsAjax &&
        typeof this.initColumnDefs.addOrEditServerFieldsAjax === 'function'
      ) {
        const json = jsonStr ? JSON.stringify(jsonStr) : ''
        const agTableId = this.initColumnDefs.agGridTableId
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
            } else {
              this.$message.error(res.message || '保存失败，请联系管理员')
            }
          })
          .finally(() => {
            typeof callback === 'function' && callback()
          })
      } else {
        this.$message.warning('保存方法丢失，请联系管理员')
      }
    },
    // 选择字段
    selectedField(item) {
      console.log('选择字段', item)
      const findItem = this.initColumnDefs.sortabledFields.find(
        (ele) => ele.headerName === item.headerName && ele.field === item.field
      )
      findItem.hide = !findItem.hide
    }
  }
}
</script>

<style lang="less" scoped>
.FieldsSet-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
