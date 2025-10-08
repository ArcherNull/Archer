<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-20 14:03:23
 * @LastEditTime: 2025-06-10 15:12:41
 * @Description: 
-->
<script setup lang="jsx" name="ImportFile">
import { reactive, ref, toRaw } from 'vue';

import { cloneDeep } from 'lodash-es';
import { ElDatePicker, ElInput, ElOption, ElSelect } from 'element-plus';
import { getImportCenterList, queryFileSource } from '#/api/system/fileCenter';
import { downLoadByATag, generateAUrl } from '#/comm/hooks/useDownload';
import { getDefaultTime, getTimePickerShortcuts } from '#/comm/utils/index';
import DKButton from '#/components/DKButton/index.vue';
import ProTable from '#/components/ProTable/index.vue';
import { Page } from '@vben/common-ui';

// ProTable 实例
const defaultTime = getDefaultTime();
const proTableRef = ref();
const typeOptionsList = ref([]);
const initParam = reactive({
  type: 1,
  data: cloneDeep(defaultTime),
  timeType: 1,
});
// 表格配置项
const columns = reactive([
  { label: '#', type: 'index', width: 80 },
  {
    align: 'left',
    label: '文件来源',
    minWidth: 200,
    prop: 'menuName',
    search: {
      el: 'select',
      label: '文件来源1',
      key: 'test',
      props: {
        filterable: true,
        placeholder: '请选择文件来源',
        options: [
          {
            label: '来源一',
            value: 1,
          },
          {
            label: '来源二',
            value: 2,
          },
          {
            label: '来源三',
            value: 3,
          },
        ],
      },
    },
  },
  {
    label: '状态',
    prop: 'status',
    tag: true,
    width: 100,
    search: {
      label: '',
      render({ searchParam }) {
        return (
          <ElInput
            clearable
            placeholder="请输入搜索值"
            v-slots={{
              prepend: () => {
                return (
                  <ElSelect
                    placeholder="请选择选项"
                    style="width: 130px"
                    vModel_trim={searchParam.type}
                  >
                    <ElOption label="部门" value={1} />
                    <ElOption label="合同主体" value={2} />
                    <ElOption label="运单号/批次号" value={3} />
                  </ElSelect>
                );
              },
            }}
            vModel_trim={searchParam.fuzzyQuery}
          ></ElInput>
        );
      },
      span: 2,
    },
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
    search: {
      label: '',
      render({ searchParam }) {
        console.log('searchParam', searchParam);
        return (
          <div style="display: flex; align-items: center">
            <ElSelect
              placeholder="请选择"
              style="width: 130px"
              vModel_trim={searchParam.timeType}
            >
              <ElOption label="签署时间" value={1} />
              <ElOption label="指派时间" value={2} />
            </ElSelect>
            <ElDatePicker
              class="input-with-select"
              end-placeholder="结束时间"
              placeholder="请输入"
              range-separator="到"
              shortcuts={getTimePickerShortcuts()}
              start-placeholder="开始时间"
              type="datetimerange"
              value-format="YYYY-MM-DD HH:mm:ss"
              vModel_trim={searchParam.data}
            ></ElDatePicker>
          </div>
        );
      },
      span: 2,
    },
  },
  {
    label: '创建时间',
    prop: 'createdTime',
    search: {
      defaultValue: defaultTime,
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
  const aUrl = generateAUrl(rInfo.errorFileUrl);
  downLoadByATag(aUrl, rInfo.fileName);
};
</script>

<template>
  <Page>
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
          下载错误文件
        </DKButton>
      </template>
    </ProTable>
  </Page>
</template>
