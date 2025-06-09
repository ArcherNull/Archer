<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-20 14:03:23
 * @LastEditTime: 2025-06-04 11:39:02
 * @Description: 
-->
<script setup lang="jsx" name="ImportFile">
import { reactive, ref, toRaw } from 'vue';

import { cloneDeep } from 'lodash-es';

import { getImportCenterList, queryFileSource } from '#/api/system/fileCenter';
import { downLoadByATag, generateAUrl } from '#/comm/hooks/useDownload';
import { getDefaultTime, getTimePickerShortcuts } from '#/comm/utils/index';
import DKButton from '#/components/DKButton/index.vue';
import ProTable from '#/components/ProTable/index.vue';

// ProTable 实例
const proTableRef = ref();
const typeOptionsList = ref([]);
const initParam = reactive({ type: 1 });
// 表格配置项
const columns = reactive([
  { label: '#', type: 'selection', width: 80 },
  { label: '#', type: 'index', width: 80 },
  {
    align: 'left',
    label: '文件来源',
    minWidth: 200,
    prop: 'menuName',
    search: {
      el: 'select',
      props: { filterable: true },
    },
  },
  {
    label: '状态',
    prop: 'status',
    tag: true,
    width: 150,
  },
  {
    label: '文件名称',
    minWidth: 200,
    prop: 'fileName',
  },
  {
    label: '开始时间',
    prop: 'createdTime',
    width: 180,
  },
  {
    label: '结束时间',
    prop: 'endTime',
    width: 180,
  },
  {
    label: '数据条数',
    prop: 'totalRecord',
    width: 100,
  },
  {
    label: '成功条数',
    prop: 'roleName',
    render: (scope) => {
      const { failRecord, totalRecord } = scope.row;
      return <>{totalRecord - failRecord}</>;
    },
    width: 100,
  },
  {
    label: '文件大小',
    prop: 'fileSize',
    width: 100,
  },
  {
    label: '耗时',
    prop: 'time',
    width: 100,
  },
  {
    label: '创建时间',
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
    width: 180,
  },
  {
    label: '创建人',
    prop: 'createUserName',
    width: 180,
  },
  { fixed: 'right', label: '操作', prop: 'operation', width: 120 },
]);

// 获取文件来源
const getQueryFileSource = async () => {
  const res = await queryFileSource();
  console.log('res123123123', res);
  const resData = res?.data || [];
  const list = [];
  resData.forEach((ele) => {
    if (ele.type === 1) {
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
  console.log('downLoadFile', rInfo)
};
</script>

<template>
  <ProTable
    ref="proTableRef"
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
    <!-- 表格 header 按钮 -->
    <template #tableHeader>
      <DKButton type="primary"> 按钮 </DKButton>
    </template>
    <!-- 表格操作  -->
    <template #operation="scope">
      <DKButton
        v-if="scope.row.errorFileUrl"
        class="textBtnCss"
        text
        @click="downLoadFile(scope.row)"
      >
        下载
      </DKButton>
    </template>
  </ProTable>
</template>
