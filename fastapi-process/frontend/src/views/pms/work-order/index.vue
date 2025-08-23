<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:29:56
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage>
    <template #action>
      <div class="flex justify-end gap-10">
        <NButton type="primary" @click="queryApprovalWorkOrder()">
          <i class="i-material-symbols:add mr-4 text-18" />
          查看我需要审批的工单
        </NButton>
        <NButton type="primary" @click="handleAdd()">
          <i class="i-material-symbols:add mr-4 text-18" />
          创建新工单
        </NButton>
      </div>
    </template>

    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="2200"
      :columns="columns"
      :is-pagination="false"
      :get-data="api.read"
      :expand="true"
    >
      <MeQueryItem label="工单标题" :label-width="70">
        <n-input
          v-model:value="queryItems.title"
          type="text"
          placeholder="请输入工单标题"
          clearable
        />
      </MeQueryItem>
    </MeCrud>

    <MeModal ref="modalRef" width="520px" :on-after-enter="openModal">
      <n-form
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="80"
        :model="modalForm"
        :disabled="modalAction === 'view'"
      >
        <n-form-item
          label="工单标题"
          path="title"
          :rule="{
            required: true,
            message: '请输入工单标题',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.title" maxlength="50" show-count clearable />
        </n-form-item>

        <n-form-item
          label="工单内容"
          path="content"
          :rule="{
            required: true,
            message: '请输入工单内容',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.content" type="textarea" maxlength="255" show-count clearable />
        </n-form-item>

        <n-form-item label="流程" path="bind_ps_id">
          <n-select
            v-model:value="modalForm.bind_ps_id"
            :options="availableProcessOptions"
            label-field="title"
            value-field="id"
            clearable
            filterable
          />
        </n-form-item>

        <n-form-item
          label="工单备注"
          path="remark"
          :rule="{
            required: false,
            message: '请输入工单备注',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.remark" type="textarea" maxlength="255" show-count clearable />
        </n-form-item>
      </n-form>
    </MeModal>

    <QueryProcessModal ref="queryProcessModalRef" @success="refreshTable" />
  </CommonPage>
</template>

<script setup>
import { MeCrud, MeModal, MeQueryItem } from '@/components'
import { useCrud } from '@/composables'
import { NButton, NTag } from 'naive-ui'
import { toRaw } from 'vue'
import api from './api'
import QueryProcessModal from './components/QueryProcessModal.vue'

defineOptions({ name: 'WorkOrderMgt' })

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})
const availableProcessOptions = ref([])
const queryProcessModalRef = ref(null)

function refreshTable() {
  $table.value?.handleSearch()
}

onMounted(() => {
  $table.value?.handleSearch()
})

const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleDelete,
  handleEdit,
} = useCrud({
  name: '工单',
  initForm: { enable: true },
  doCreate: api.create,
  doDelete: api.delete,
  doUpdate: api.update,
  refresh: refreshTable,
})

const columns = [
  { title: '工单标题', key: 'title', width: 150, ellipsis: { tooltip: true } },
  { title: '工单内容', key: 'content', width: 300, ellipsis: { tooltip: true } },
  { title: '工单备注', key: 'remark', width: 300, ellipsis: { tooltip: true } },
  { title: '流程发起人', key: 'bind_by', width: 100 },
  { title: '工单状态', key: 'wo_state', width: 100, render: row =>
    h(
      NTag,
      {
        type: row.wo_state === 0 ? 'error' : row.wo_state === 1 ? 'info' : row.wo_state === 2 ? 'success' : 'error',
      },
      {
        default: () => row.wo_state === 0 ? '已删除' : row.wo_state === 1 ? '待审批' : row.wo_state === 2 ? '审批成功' : '审批拒绝',
      },
    ) },
  { title: '待审批人', key: 'wait_approve_names', width: 160 },
  { title: '更新人', key: 'updated_by', width: 100 },
  { title: '更新时间', key: 'updated_at', width: 160 },
  { title: '创建人', key: 'created_by', width: 100 },
  { title: '创建时间', key: 'created_at', width: 160 },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    align: 'right',
    fixed: 'right',
    hideInExcel: true,
    render(row) {
      return [
        h(NButton, {
          size: 'small',
          type: 'primary',
          secondary: true,
          onClick: () => handleEdit(row),
        }, {
          default: () => '编辑',
        }),

        h(NButton, {
          size: 'small',
          type: 'primary',
          secondary: true,
          style: 'margin-left: 12px;',
          onClick: () => queryProcess(row),
        }, {
          default: () => '查看流程',
        }),

        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            style: 'margin-left: 12px;',
            onClick: () => handleDelete(row.id),
          },
          {
            default: () => '删除',
          },
        ),
      ]
    },
  },
]

// 查看流程
function queryProcess(row) {
  console.log('查看流程', row)
  queryProcessModalRef.value.handleOpen({
    row: toRaw(row),
  })
}

// 打开弹窗
async function openModal() {
  // 获取可以审批的流程
  const res = await api.get_available_process()
  const resData = res?.data || []
  availableProcessOptions.value = resData
}

// 查询审批工单
async function queryApprovalWorkOrder() {
  console.log('查询审批工单')
  const res = await api.get_work_order_approval_process()
  const resData = res?.data || []
  console.log('resData13123123', resData)
}
</script>
