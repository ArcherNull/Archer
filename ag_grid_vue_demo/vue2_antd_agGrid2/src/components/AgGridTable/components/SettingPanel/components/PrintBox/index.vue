<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-03 09:01:27
 * @LastEditTime: 2024-12-27 09:21:05
 * @Description:
 * 参考文档 : https://juejin.cn/post/7292975471448670248?searchId=20240909111646A492930751198F0FF710
-->
<template>
  <div class="PrintBox">
    <FirstTitle title="打印模板">
      <div slot="left">
        <DKBtnList :btn-list-config="printBtnListConfig" @clickFun="clickFun" />
      </div>
      <data slot="right">
        <a-input
          v-model="printSearchValue"
          size="small"
          placeholder="请输入搜索文本"
          style="width: 150px; margin-right: 6px"
        />
      </data>
      <div slot="content">
        <div><DKEmpty></DKEmpty></div>
      </div>
    </FirstTitle>

    <FirstTitle title="锐浪报表打印">
      <div slot="left">
        <DKBtnList :btn-list-config="printBtnListConfig" @clickFun="clickFun" />
      </div>
      <data slot="right">
        <a-input
          v-model="ruilangSearchValue"
          size="small"
          placeholder="请输入搜索文本"
          style="width: 150px; margin-right: 6px"
        />
      </data>
      <div slot="content">
        <div><DKEmpty></DKEmpty></div>
      </div>
    </FirstTitle>
  </div>
</template>

<script>
export default {
  name: 'PrintBox',
  components: {
    FirstTitle: () => import('../FirstTitle/index.vue'),
    DKBtnList: () => import('../DKBtnList/index.vue'),
    DKEmpty: () => import('../DKEmpty/index.vue')

  },
  data() {
    return {
      // 打印模板搜素值
      printSearchValue: '',
      // 锐浪报表搜素值
      ruilangSearchValue: '',
      // 导出按钮
      printBtnListConfig: {
        config: {
          size: 'small'
        },
        schemas: [
          {
            type: 'primary',
            btnText: '打印'
          }
        ]
      },
      // 锐浪按钮
      ruilangBtnListConfig: {
        config: {
          size: 'small'
        },
        schemas: [
          {
            type: 'primary',
            btnText: '打印'
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

<style lang="less" scoped></style>
