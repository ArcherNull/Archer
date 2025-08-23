<template>
  <div class="ConfigBox">
    <FirstTitle title="全局搜素">
      <div slot="left">
        <DKBtnList :btn-list-config="searchBtnListConfig" @clickFun="clickFun" />
      </div>
      <div slot="content">
        <div class="FieldsSet-header">
          <a-checkbox v-model="searchBeforeChecked">搜索后选中</a-checkbox>
        </div>
        <div class="FieldsSet-content">
          <a-input-search
            placeholder="请输入要搜索的值"
            :loading="searchLoading"
            enter-button
            allowClear
            @search="onGlobalSearch"
          />
        </div>
      </div>
    </FirstTitle>

    <FirstTitle title="主题设置">
      <div slot="left">
        <DKBtnList :btn-list-config="conBtnListConfig" @clickFun="clickFun" />
      </div>
      <div slot="content">
        <div class="FieldsSet-content">
          <a-select :default-value="defaultTheme" style="width: 200px" @change="themeChange">
            <a-select-option :value="item.value" v-for="(item, index) in themeList" :key="index">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </div>
      </div>
    </FirstTitle>

    <FirstTitle title="全局配置">
      <div slot="left">
        <DKBtnList :btn-list-config="conBtnListConfig" @clickFun="clickFun" />
      </div>
      <div slot="content">
        <div class="FieldsSet-content">
          <!-- <FieldItem :fields-list="fieldsList" /> -->
        </div>
      </div>
    </FirstTitle>

    <FirstTitle title="功能设置">
      <div slot="left">
        <DKBtnList :btn-list-config="conBtnListConfig" @clickFun="clickFun" />
      </div>
      <div slot="content">
        <div class="FieldsSet-content">
          <!-- <FieldItem :fields-list="fieldsList" /> -->
        </div>
      </div>
    </FirstTitle>

    <FirstTitle title="快捷功能">
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
</template>

<script>
import { AG_GRID_DEFAULT_THEME } from '@/components/AgGridTable/common/agGrid-config.js'

export default {
  name: 'ConfigBox',
  components: {
    FirstTitle: () => import('../FirstTitle/index.vue'),
    DKBtnList: () => import('../DKBtnList/index.vue')
  },
  props: {
    agTableOptions: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      // 搜索loading
      searchLoading: false,
      // 搜索后选中
      searchBeforeChecked: false,

      searchBtnListConfig: {
        config: {
          size: 'small'
        },
        schemas: [
          {
            type: 'link',
            btnText: '高级搜索'
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
      },
      // 默认主题
      defaultTheme: AG_GRID_DEFAULT_THEME,
      themeList: [
        {
          label: 'balham',
          value: 'balham'
        },
        {
          label: 'alpine',
          value: 'alpine'
        },
        {
          label: 'material',
          value: 'material'
        }
      ]
    }
  },
  methods: {
    // 全局搜索
    onGlobalSearch(ele) {
      console.log('全局搜索', ele)
      const { agTableApi } = this.agTableOptions
      if (agTableApi) {
        this.searchLoading = true
        this.agTableOptions.agTableApi.setQuickFilter(ele)
        this.searchLoading = false
      } else {
        this.$message.warning('api功能出错，请联系管理员')
      }
    },
    // 主题更换
    themeChange(ele) {
      console.log('主题更换', ele)
      this.agTableOptions.theme = ele
    },
    clickFun(data) {
      console.log('item', data)
      const { item } = data
      switch (item.btnText) {
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
.FieldsSet-header {
  margin-bottom: 10px;
}
</style>
