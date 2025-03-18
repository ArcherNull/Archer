<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-20 16:20:50
 * @LastEditTime: 2025-03-13 17:49:30
 * @Description: 
-->
<script lang="tsx" setup name="fileCenter">
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import ExportFile from './components/exportFile/index.vue';
import ImportFile from './components/importFile/index.vue';

const tabActive = ref('import');
</script>

<template>
  <Page content-class="table-box">
    <el-tabs v-model="tabActive" class="table-tabs">
      <el-tab-pane class="tabItemCss" label="element table" name="import">
        <div class="table-tab-box">
          <ImportFile />
        </div>
      </el-tab-pane>
      <el-tab-pane class="tabItemCss" label="ag-grid" name="export">
        <div class="table-tab-box">
          <ExportFile />
        </div>
      </el-tab-pane>
    </el-tabs>
  </Page>
</template>

<style lang="scss" scoped>
.table-tabs {
  box-sizing: border-box;
  height: 100%;
}

.tabItemCss {
  box-sizing: border-box;
  height: 100%;
  overflow-y: scroll;
}
</style>
