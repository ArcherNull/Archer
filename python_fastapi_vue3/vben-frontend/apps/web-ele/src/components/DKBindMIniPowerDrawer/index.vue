<script setup name="DKBindMIniPowerDrawer">
import { defineEmits, defineExpose, reactive, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { ElMessage } from 'element-plus';
import { cloneDeep } from 'lodash-es';

import { getDepartmentTree } from '#/api/core/department';
import { userBatchAuth } from '#/api/core/role';
import { getUserListUser } from '#/api/core/user';
import ProTable from '#/components/ProTable/index.vue';

const emit = defineEmits(['success']);
const [Drawer, drawerApi] = useVbenDrawer({
  confirmText: '绑定',
  onCancel() {
    drawerApi.close();
  },
  onConfirm() {
    console.log('点击确认按钮触发');
    bindUserFun();
  },
});
const drawerConfirmLoading = ref(false);
// ProTable 实例
const proTableRef = ref();
const roleGroupId = ref();
const subDepartmentType = ref();
const departmentType = ref();
const defaptOptions = ref([]);
// const depaOptionsList = ref([]);
const initParam = reactive({ status: 1 });
const columns = reactive([
  { fixed: 'left', type: 'selection', width: 70 },
  // { label: '#', type: 'index', width: 80 },
  {
    fieldNames: {
      label: 'fullName',
      value: 'groupId',
      children: 'children',
    },
    label: '用户姓名',
    prop: 'nickName',
    search: {
      el: 'cascader',
      key: 'orgGroupId',
      label: '所属部门',
      props: {
        filterable: true,
        options: defaptOptions,
      },
    },
    // search: {
    //   el: 'input',
    //   props: {
    //     placeholder: '请输入姓名',
    //   },
    // },
  },
  {
    label: '登录账号',
    prop: 'jobNumber',
    search: {
      el: 'input',
      key: 'keyword',
      label: '用户账号',
      props: {
        placeholder: '请输入登录账号',
      },
    },
  },
  {
    label: '手机',
    prop: 'mobile',
    // search: {
    //   el: 'input',
    //   props: {
    //     maxlength: 11,
    //     placeholder: '请输入手机',
    //     type: 'number',
    //   },
    // },
    width: 140,
  },
  {
    label: '所属部门',
    prop: 'orgName',
    width: 140,
  },
  // {
  //   label: '创建时间',
  //   prop: 'createdTime',
  //   width: 180,
  // },
  {
    enum: [
      {
        label: '是',
        value: 1,
      },
      {
        label: '否',
        value: 0,
      },
    ],
    label: '是否授权',
    prop: 'status',
    tag: true,
  },
  // { fixed: 'right', label: '操作', prop: 'operation', width: 110 },
]);

const getTableList = (params) => {
  if (params.orgGroupId) {
    params.orgGroupId = params.orgGroupId[params.orgGroupId.length - 1];
  }
  const newParams = cloneDeep(params);
  return getUserListUser(newParams);
};

async function handleOpen(row = {}) {
  const groupId = row?.groupId;
  if (groupId) {
    roleGroupId.value = groupId;
    subDepartmentType.value = row?.subDepartmentType;
    departmentType.value = row?.departmentType;
    drawerApi.open();
    await getDepaList();
  } else {
    ElMessage.warning('当前角色缺失groupId， 无法数据授权');
  }
}

// 获取部门列表
async function getDepaList() {
  const res = await getDepartmentTree();
  console.log('部门列表', res);
  const resList = res?.data || [];
  defaptOptions.value = resList;
}

// 数据授权
async function bindUserFun() {
  const selectedList = proTableRef.value.selectedList;
  if (selectedList?.length) {
    try {
      drawerConfirmLoading.value = true;
      const params = {
        departmentType: departmentType.value,
        levelNumber: roleGroupId.value.toString(),
        subDepartmentType: subDepartmentType.value, // 部门维度100   账龄维度101
        userIdList: selectedList.map((ele) => ele.userId),
      };
      const res = await userBatchAuth(params);
      if (res.code !== 200) return;
      ElMessage.success('绑定成功');
      drawerApi.close();
      emit('success');
    } finally {
      drawerConfirmLoading.value = false;
    }
  } else {
    ElMessage.warning('请选择需要绑定的用户');
  }
}

defineExpose({
  handleOpen,
});
</script>

<template>
  <Drawer
    :confirm-loading="drawerConfirmLoading"
    class="w-[60%]"
    content-class="main-box"
    title="数据授权"
  >
    <template #default>
      <div class="table-box table-box-scroll">
        <ProTable
          ref="proTableRef"
          :columns="columns"
          :init-param="initParam"
          :is-card="false"
          :is-scroll="true"
          :request-api="getTableList"
          :search-col="{ xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }"
          :tool-button="['refresh', 'setting', 'search']"
        />
      </div>
    </template>
  </Drawer>
</template>
