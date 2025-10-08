<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-20 14:03:23
 * @LastEditTime: 2025-06-04 14:22:25
 * @Description: 
-->
<script setup lang="jsx" name="ImportFile">
import { reactive, ref, toRaw } from 'vue';

import { cloneDeep } from 'lodash-es';
import { $t } from '#/locales';

import { getImportCenterList, queryFileSource } from '#/api/system/fileCenter';
import { downLoadByATag, generateAUrl } from '#/comm/hooks/useDownload';
import { getDefaultTime, getTimePickerShortcuts } from '#/comm/utils/index';
import DKAGTable from '#/components/DKAGTable/index.vue';
import DKButton from '#/components/DKButton/index.vue';
import { Page } from '@vben/common-ui';

// DKAGTable 实例
const DKAGTableRef = ref();
const typeOptionsList = ref([]);
const initParam = reactive({ type: 2 });
// 表格配置项
const columns = reactive([
  { label: '#', type: 'index', width: 80 },
  {
    label: $t('system.menu.menuTitle'),
    minWidth: 250,
    prop: 'menuName',
    search: {
      el: 'select',
      props: { filterable: true },
    },
  },
  {
    label: $t('system.menu.authCode'),
    minWidth: 200,
    prop: 'fileName',
  },
  {
    label: $t('system.menu.authCode'),
    minWidth: 200,
    prop: 'fileName',
  },
  {
    label: $t('system.menu.path'),
    prop: 'path',
    width: 180,
  },
  {
    align: 'left',
    field: 'component',
    minWidth: 200,
    title: $t('system.menu.component'),
  },
  {
    label: $t('system.menu.status'),
    prop: 'status',
    width: 140,
    render(scope){
      const { value } = scope
      return <ElTag type='primary'>{value}</ElTag>
    },
  },
  {
    label: $t('system.menu.createdTime'),
    prop: 'createdTime',
    search: {
      defaultValue: getDefaultTime(),
      el: 'date-picker',
      key: 'cTime',
      props: {
        clearable: true,
        shortcuts: getTimePickerShortcuts(),
        type: 'datetimerange',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      span: 2,
    },
    width: 200,
  },
  { fixed: 'right', label: '操作', prop: 'operation', width: 100 },
]);

// 获取文件来源
const getQueryFileSource = async () => {
  const res = await queryFileSource();
  const resData = res?.data || [];
  const list = [];
  resData.forEach((ele) => {
    if (ele.type === 2) {
      list.push({
        label: ele.menu_name,
        value: ele.menu_name,
      });
    }
  });
  typeOptionsList.value = list;
};

const exportParams = () => {
  const newParams = cloneDeep(proTableRef.value.searchParam);
  return newParams;
};

const getTableList = async (params) => {
  const newParams = cloneDeep(params);
  const { cTime, ...restObj } = newParams;
  await getQueryFileSource();

  return getImportCenterList({
    ...restObj,
    createdTime: cTime?.[0],
    endTime: cTime?.[1],
  });
};
// 下载文件
const downLoadFile = (row) => {
  const rInfo = toRaw(row);
  const aUrl = generateAUrl(rInfo.originImportFileUrl);
  downLoadByATag(aUrl, rInfo.fileName);
};
</script>

<template>
  <Page>
  <DKAGTable
    ref="DKAGTableRef"
    :columns="columns"
    :indent="20"
    :init-param="initParam"
    :file-config="{
      fileType: '94',
      importFileType: '93',
      template: '费控统计配置.xlsx',
      exportParam: exportParams,
    }"
    :request-api="getTableList"
  >
    <template #tableHeader>
      <DKButton type="primary"> 按钮 </DKButton>
    </template>
    <!-- 表格操作  -->
    <template #operation="scope">
      <DKButton
        v-if="scope.row.originImportFileUrl"
        class="textBtnCss"
        text
        @click="downLoadFile(scope.row)"
      >
        下载
      </DKButton>
    </template>
  </DKAGTable>
</Page>
</template>
