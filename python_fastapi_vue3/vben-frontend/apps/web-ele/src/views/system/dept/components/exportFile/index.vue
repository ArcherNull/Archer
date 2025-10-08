<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-06-10 09:51:37
 * @LastEditTime: 2025-06-10 11:55:50
 * @Description: 
-->

<script setup name="accountManagement">
import { reactive, ref, toRaw } from 'vue';

import { Page } from '@vben/common-ui';

import { ElMessage, ElMessageBox } from 'element-plus';
import { cloneDeep } from 'lodash-es';

import { deleteDepartment, getDepartmentTree } from '../../api';
import { convertTreeDataToArray, isNotEmptyArr  } from '#/comm/utils/index';
import DKButton from '#/components/DKButton/index.vue';
import DKAGTable from '#/components/DKAGTable/index.vue';

import AddDepaModal from '../components/AddDepaModal.vue';

const dKAGTableRef = ref();
const initParam = reactive({});
const addDepaModalRef = ref();
const deleteConfirmLoading = ref(false);
const tableData = ref([]);

// 表格配置项
const columns = reactive([
  { label: '#', type: 'selection', width: 80 },
  { label: '#', type: 'index', width: 80 },
  {
    align: 'left',
    label: '部门名称',
    prop: 'fullName',
    width: 500,
    autoGroup: true,
    search: {
      el: 'input',
      props: {
        placeholder: '请输入部门名称',
      },
    },
  },
  {
    label: '员工数',
    prop: 'userCount',
  },
  {
    label: '部门描述',
    prop: 'remark',
  },
  {
    label: '创建时间',
    prop: 'createdTime',
    width: 180,
  },
  { fixed: 'right', label: '操作', prop: 'operation', width: 160 },
]);

const getTableList = async (params) => {
  const newParams = cloneDeep(params);
  const { fullName } = newParams;

  if (isNotEmptyArr(tableData.value) && dKAGTableRef.value) {
    const { name } = newParams;
    dKAGTableRef.value.gridApi?.setGridOption('quickFilterText', name);
  } else {
    const res = await getDepartmentTree();
    let resData = res?.data || [];
    const nData = convertTreeDataToArray(cloneDeep(resData), {
      key: 'id',
      label: 'fullName',
      value: 'id',
    });
    console.log('nData', nData)
    // leafIdList.value = nData.lastLevelIdData;
    tableData.value = nData.result
  }
};

// 刷新表格
const refreshTable = () => {
  dKAGTableRef.value?.clearSelection();
  dKAGTableRef.value?.getTableList();
};

// 新增部门
const addNewDepart = (type, row = {}) => {
  addDepaModalRef.value.handleOpen({
    row: toRaw(row),
    type,
  });
};

// 批量删除
const batchDelete = (ids) => {
  if (ids) {
    ElMessageBox.confirm('确认删除该数据?', '温馨提示', {
      confirmButtonLoading: deleteConfirmLoading.value,
      type: 'warning',
    }).then(async () => {
      const res = await deleteDepartment(ids);
      res.code === 200 && ElMessage.success('删除成功');
      refreshTable();
      ElMessage.success('删除成功');
    });
  } else {
    ElMessage.warning('参数缺失');
  }
};

const getDataPath = (data) => {
  return data?.levelNumber?.split('-');
};
</script>

<template>
  <DKAGTable
    ref="dKAGTableRef"
    :columns="columns"
    :data="tableData"
    :get-data-path="getDataPath"
    :indent="20"
    :init-param="initParam"
    :pagination="false"
    :request-api="getTableList"
  >
    <!-- 表格 header 按钮 -->
    <template #tableHeader="scope">
      <DKButton power="add" type="primary" @click="addNewDepart('create')">
        新建部门
      </DKButton>

      <DKButton
        :disabled="!scope.isSelected"
        type="danger"
        @click="batchDelete(scope.selectedListIds)"
      >
        批量删除
      </DKButton>
    </template>

    <!-- 表格操作  -->
    <template #operation="scope">
      <div class="flex justify-center gap-2">
        <DKButton
          class="textBtnCss"
          power="add"
          text
          @click="addNewDepart('create', scope.row)"
        >
          新增
        </DKButton>
        <DKButton
          class="textBtnCss"
          power="edit"
          text
          @click="addNewDepart('edit', scope.row)"
        >
          编辑
        </DKButton>
        <DKButton
          class="textBtnCss"
          power="delete"
          text
          type="danger"
          @click="batchDelete(scope.row.id)"
        >
          删除
        </DKButton>

        <AddDepaModal ref="addDepaModalRef" @success="refreshTable" />
      </div>
    </template>
  </DKAGTable>
</template>
