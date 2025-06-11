<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-20 14:03:23
 * @LastEditTime: 2025-06-10 17:59:47
 * @Description: 
-->
<script setup lang="jsx" name="ImportFile">
import { reactive, ref, toRaw } from 'vue';
import { cloneDeep, debounce } from 'lodash-es';
import { ElTag } from 'element-plus';
import { getImportCenterList, queryFileSource } from '#/api/system/fileCenter';
import { downLoadByATag, generateAUrl } from '#/comm/hooks/useDownload';
import { convertNumber, numberRoundUp } from '#/comm/math/index';

import {
  getDefaultTime,
  getTimePickerShortcuts,
  getTableAgSummaries,
  calcSum,
  calcAverage,
} from '#/comm/utils/index';
import DKAGTable from '#/components/DKAGTable/index.vue';
import DKButton from '#/components/DKButton/index.vue';


// DKAGTable 实例
const DKAGTableRef = ref();
const typeOptionsList = ref([]);
const initParam = reactive({ type: 2 });
// 表格配置项
const columns = reactive([
  { label: '#', type: 'selection', width: 80 },
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
    cellStyle: {
      color: 'pink',
    },
  },
  {
    label: '状态',
    prop: 'status',
    width: 150,
    render(scope) {
      const { value } = scope;
      return value && <ElTag type="primary">{value}</ElTag>;
    },
    headerStyle: {
      backgroundColor: 'red',
      color: 'white',
    },
    cellStyle: (params) => {
      return params.value === '部分成功'
        ? {
            backgroundColor: 'green',
          }
        : {};
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
    width: 140,
  },
  {
    label: '成功条数',
    prop: 'successRecord',
    render: (scope) => {
      if (scope?.params?.node?.rowPinned === 'bottom') {
        return scope?.params.value;
      }
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
    width: 160,
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
  console.log('downLoadFile', rInfo);
};

// 合计行
const getSummaries = (param) => {
  const { data, columns } = param;
  return getTableAgSummaries({
    averageColumns: [],
    columns,
    data,
    sumColumns: ['totalRecord'],
    type: 'agTable',
    specSasColumns: {
      successRecord: (tData, property) => {
        return calcSum(tData, (row) => {
          const { failRecord, totalRecord } = row;
          return convertNumber(totalRecord) - convertNumber(failRecord);
        });
      },
      fileSize: (tData) => {
        const size = calcSum(tData, (row) => {
          const { fileSize } = row;
          return convertNumber(fileSize?.replace('KB', ''));
        });
        return `总共${size}KB`;
      },
      time: (tData) => {
        const aVal = calcAverage(tData, (row) => {
          const { time } = row;
          return convertNumber(time?.replace('s', ''));
        });
        return `平均${aVal}s`;
      },
    },
  });
};

const paginationChangedFun = debounce((params) => {
  //  获取列设置
  const columnsDefs = params.api.getColumnDefs();
  const filteredData = [];
  // 获取筛选框过后的数据
  params.api.forEachNodeAfterFilterAndSort((node) => {
    filteredData.push(toRaw(node.data));
  });
  const sumRow = getSummaries({
    data: filteredData,
    columns: columnsDefs,
  });
  if (sumRow) {
    params.api.setGridOption('pinnedBottomRowData', sumRow);
    params.api.refreshCells({ force: true });
  }
}, 500);
</script>

<template>
  <DKAGTable
    ref="DKAGTableRef"
    :columns="columns"
    :indent="20"
    :init-param="initParam"
    :grid-options-fun="
      () => {
        return {
          rowHeight: 36,
          getRowStyle: (params) => {
            if (params.node.rowPinned === 'bottom') {
              return {
                backgroundColor:  'transparent',
                fontWeight: 'bold',
              };
            }
          },

          // getRowClass: (params) => {
          //   if (params.node.rowPinned === 'bottom') {
          //     return 'font-bold bg-gray-100 dark:bg-gray-700';
          //   }
          // },
        };
      }
    "
    :file-config="{
      fileType: '94',
      importFileType: '93',
      template: '费控统计配置.xlsx',
      exportParam: exportParams,
    }"
    :request-api="getTableList"
    @paginationChanged="paginationChangedFun"
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
