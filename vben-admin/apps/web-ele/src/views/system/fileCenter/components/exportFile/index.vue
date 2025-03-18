<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-20 14:03:23
 * @LastEditTime: 2025-03-13 18:53:51
 * @Description: 
-->
<script setup lang="jsx" name="ImportFile">
import { reactive, ref, toRaw } from 'vue';

import { cloneDeep } from 'lodash-es';

import { getImportCenterList, queryFileSource } from '#/api/system/fileCenter';
import { downLoadByATag, generateAUrl } from '#/comm/hooks/useDownload';
import { getDefaultTime, getTimePickerShortcuts } from '#/comm/utils/index';
import DKAGTable from '#/components/DKAGTable/index.vue';
import DKButton from '#/components/DKButton/index.vue';

// DKAGTable 实例
const DKAGTableRef = ref();
const typeOptionsList = ref([]);
const initParam = reactive({ type: 2 });
// 表格配置项
const columns = reactive([
  { label: '#', type: 'index', width: 80 },
  {
    align: 'left',
    enum: typeOptionsList,
    label: '文件来源',
    minWidth: 250,
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
    width: 140,
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
    width: 140,
  },
  {
    label: '成功条数',
    prop: 'roleName',
    render: (scope) => {
      const { failRecord, totalRecord } = scope.row;
      return <>{totalRecord - failRecord}</>;
    },
    width: 140,
  },
  {
    label: '文件大小',
    prop: 'fileSize',
    width: 140,
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
</template>
