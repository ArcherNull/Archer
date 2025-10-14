<template>
  <div class="FileCenter">
    <FirstTitle title="导出">
      <div slot="content">
        <div class="FieldsSet-content">
          <div class="FieldsSet-content-btn">
            <DKBtnList :btn-list-config="exportBtnListConfig" @clickFun="clickFun" />
          </div>

          <FirstTitle :isShowTitleBg="false" title="导出文件历史记录">
            <div slot="left">
              <a-tooltip placement="top">
                <template slot="title">
                  <span>前端导出的文件不纳入记录</span>
                </template>
                <a-icon type="exclamation-circle" />
              </a-tooltip>
            </div>
            <div slot="content">
              <div class="FieldsSet-content">
                <DKEmpty></DKEmpty>
              </div>
            </div>
          </FirstTitle>
        </div>
      </div>
    </FirstTitle>

    <FirstTitle title="导入">
      <div slot="content">
        <div class="FieldsSet-content">
          <div class="FieldsSet-content-btn">
            <DKBtnList :btn-list-config="importBtnListConfig" @clickFun="clickFun" />
          </div>

          <FirstTitle :isShowTitleBg="false" title="导入文件历史记录">
            <div slot="left">
              <a-tooltip placement="top">
                <template slot="title">
                  <span>前端解析文件导入不纳入记录</span>
                </template>
                <a-icon type="exclamation-circle" />
              </a-tooltip>
            </div>
            <div slot="content">
              <div class="FieldsSet-content">
                <DKEmpty></DKEmpty>
              </div>
            </div>
          </FirstTitle>
        </div>
      </div>
    </FirstTitle>

    <!-- 上传解析excel文件 -->
    <ParsingExcelModel :visible.sync="openParsingExcelModel"></ParsingExcelModel>
  </div>
</template>

<script>
export default {
  name: 'FileCenter',
  components: {
    FirstTitle: () => import('../FirstTitle/index.vue'),
    ParsingExcelModel: () => import('./components/ParsingExcelModel/index.vue'),
    DKBtnList: () => import('../DKBtnList/index.vue'),
    DKEmpty: () => import('../DKEmpty/index.vue')
  },
  props: {
    // 表头实例
    initColumnDefs: {
      type: [Object, null],
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      openParsingExcelModel: false,
      // 导出
      exportBtnListConfig: {
        config: {
          size: 'small'
        },
        schemas: [
          {
            type: 'primary',
            btnText: '导出'
          },
          {
            type: 'primary',
            btnText: '下载导入模板'
          },
          {
            type: 'primary',
            btnText: '快捷导出Excel'
          }
        ]
      },
      // 导入
      importBtnListConfig: {
        config: {
          size: 'small'
        },
        schemas: [
          {
            type: 'primary',
            btnText: '导入Excel'
          }
        ]
      }
    }
  },
  methods: {
    clickFun(data) {
      console.log('item', data)
      const { item } = data
      switch (item.btnText) {
        case '导入Excel':
          console.log('导入Excel')
          this.openParsingExcelModel = true
          break
        case '保存':
          console.log('保存')
          break
        case '重置':
          console.log('重置')
          break
      }
    }
  }
}
</script>

<style lang="less" scoped>
.FieldsSet-content-btn {
  margin-bottom: 10px;
}
</style>
