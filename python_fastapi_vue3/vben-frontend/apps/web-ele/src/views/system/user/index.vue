<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-20 16:20:50
 * @LastEditTime: 2025-06-04 10:04:32
 * @Description: 
-->
<script lang="tsx" setup name="fileCenter">
import { ref } from 'vue';

import { Page, usePageCss } from '@vben/common-ui';

import ExportFile from './components/exportFile/index.vue';
import ImportFile from './components/importFile/index.vue';
import { cn } from '@vben-core/shared/utils';

const tabActive = ref('import');
const tablePageCss = usePageCss('tabTable')

</script>

<template>
  <Page :isTablePage="false">
    <el-tabs v-model="tabActive">
      <el-tab-pane label="element table" name="import">
        <div :class="cn('h-full', tablePageCss)">
          <ImportFile />
        </div>
      </el-tab-pane>
      <el-tab-pane label="ag-grid" name="export">
        <div :class="cn('h-full', tablePageCss)">
          <ExportFile />
        </div>
      </el-tab-pane>
    </el-tabs>
  </Page>
</template>

<style lang="scss" scoped>
</style>
