<template>
  <div class="UserManage">
    <div class="UserManage-header" flex="main:justify cross:center">
      <SearchBox v-model="searchData" @search="search"></SearchBox>

      <BtnList :btn-list="btnList" @handleClick="handleClick"></BtnList>
    </div>
    <div class="UserManage-content">
      <MyTable></MyTable>
    </div>
  </div>
</template>

<!-- eslint-disable no-unused-vars -->
<script  setup>
import { ref } from 'vue'

import MyTable from './components/MyTable.vue'
import SearchBox from './components/SearchBox.vue'
import BtnList from './components/BtnList.vue'

const searchData = ref('')

const btnList = [
  {
    btnText: '新增',
    type: 'primary'
  },
  {
    btnText: '删除',
    type: 'danger'
  },
  {
    btnText: '审核',
    type: 'success'
  }
]

const search = () => {
  console.log('搜索值', searchData.value)
}

const handleClick = (item) => {
  const { btnText } = item
  switch (btnText) {
    case '新增':
      console.log('新增')
      break
    case '删除':
      console.log('删除')
      break
    case '审核':
      console.log('审核')
      break
  }
}
</script>

<style lang="scss" scoped>
</style>
