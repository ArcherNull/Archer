<template>
  <CommonPage>
    <template #action>
      <NButton type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        创建新流程
      </NButton>
    </template>

    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="2000"
      :columns="columns"
      :is-pagination="false"
      :get-data="api.read"
      :expand="true"
    >
      <MeQueryItem label="流程标题" :label-width="80">
        <NInput
          v-model:value="queryItems.title"
          type="text"
          placeholder="请输入流程标题"
          clearable
        />
      </MeQueryItem>

      <MeQueryItem label="流程状态" :label-width="80">
        <NSelect
          v-model:value="queryItems.process_state"
          clearable
          :options="[
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ]"
        />
      </MeQueryItem>
    </MeCrud>

    <MeModal ref="modalRef" width="900px" :on-after-enter="openModal">
      <n-form
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="80"
        :model="modalForm"
        :disabled="modalAction === 'view'"
      >
        <div class="max-h-[70vh] overflow-y-scroll">
          <MeContanier class-type="" title="基本信息" content-class="pt-16px">
            <NFormItem
              label="流程标题"
              path="title"
              :rule="{
                required: true,
                message: '请输入流程标题',
                trigger: ['input', 'blur'],
              }"
            >
              <NInput
                v-model:value="modalForm.title"
                maxlength="50"
                show-count
                clearable
              />
            </NFormItem>

            <NFormItem
              label="流程内容"
              path="content"
              :rule="{
                required: true,
                message: '请输入流程内容',
                trigger: ['input', 'blur'],
              }"
            >
              <NInput
                v-model:value="modalForm.content"
                type="textarea"
                maxlength="255"
                show-count
                clearable
              />
            </NFormItem>

            <NFormItem label="状态" path="process_state">
              <NSwitch
                v-model:value="modalForm.process_state"
                :default-value="1"
                :checked-value="1"
                :unchecked-value="0"
              >
                <template #checked>
                  启用
                </template>
                <template #unchecked>
                  停用
                </template>
              </NSwitch>
            </NFormItem>

            <NFormItem
              label="流程备注"
              path="remark"
              :rule="{
                required: false,
                message: '请输入流程备注',
                trigger: ['input', 'blur'],
              }"
            >
              <NInput
                v-model:value="modalForm.remark"
                type="textarea"
                maxlength="255"
                show-count
                clearable
              />
            </NFormItem>
          </MeContanier>

          <!-- 流程节点数据 -->
          <MeContanier
            class-type=""
            :content-status="processNodeContentStatus"
            title="流程节点"
            content-class="pt-16px"
          >
            <template #subTitle>
              <div class="flex gap-10">
                <NButton type="primary" text @click="handleAddProcessNode()">
                  <i class="i-material-symbols:add mr-4 text-18" />
                  新增流程节点
                </NButton>
                <NButton
                  type="error"
                  :disabled="!processNodeCheckedKeys.length"
                  text
                  @click="batchDeleteProcessNode(processNodeCheckedKeys)"
                >
                  <i class="i-material-symbols:delete-outline mr-4 text-18" />
                  批量删除
                </NButton>
              </div>
            </template>
            <div>
              <NDataTable
                :columns="processNodeColumns"
                striped
                :loading="tableLoading"
                :data="modalForm.processNodeList"
                :scroll-x="600"
                :style="{ height: '350px' }"
                :row-key="(row) => row.id || row.cId"
                :on-update:checked-row-keys="processNodeCheckedKeysChange"
                flex-height
              />
            </div>
          </MeContanier>
        </div>
      </n-form>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { MeContanier, MeCrud, MeModal, MeQueryItem } from '@/components'
import { useCrud } from '@/composables'
import {
  NButton,
  NDataTable,
  NFormItem,
  NInput,
  NSelect,
  NSwitch,
} from 'naive-ui'
import { v4 as uuidv4 } from 'uuid'
import { h, toRaw } from 'vue'
import api from './api'

defineOptions({ name: 'ProcessSettingMgt' })

const $table = ref(null)
const queryItems = ref({})
onMounted(() => {
  $table.value?.handleSearch()
})

const processNodeContentStatus = ref('empty')
const approveUserOptions = ref([])
const processNodeCheckedKeys = ref([])
const tableLoading = ref(false)

const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleDelete,
  handleEdit,
} = useCrud({
  name: '流程',
  initForm: { enabled: true },
  doCreate: api.create,
  doDelete: api.delete,
  doUpdate: api.update,
  refresh: () => $table.value?.handleSearch(),
})

const columns = [
  { title: '流程标题', key: 'title', width: 150, ellipsis: { tooltip: true } },
  {
    title: '流程内容',
    key: 'content',
    width: 300,
    ellipsis: { tooltip: true },
  },
  { title: '流程备注', key: 'remark', width: 300, ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'process_state',
    width: 100,
    render: row =>
      h(
        NSwitch,
        {
          size: 'small',
          rubberBand: false,
          value: row.process_state,
          checkedValue: 1,
          uncheckedValue: 0,
          loading: !!row.enableLoading,
          onUpdateValue: () => handleEnable(row),
        },
        {
          checked: () => '启用',
          unchecked: () => '停用',
        },
      ),
  },
  { title: '更新人', key: 'updated_by', width: 100 },
  { title: '更新时间', key: 'updated_at', width: 160 },
  { title: '创建人', key: 'created_by', width: 100 },
  { title: '创建时间', key: 'created_at', width: 160 },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    align: 'right',
    fixed: 'right',
    hideInExcel: true,
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            secondary: true,
            onClick: () => handleEdit(row),
          },
          {
            default: () => '编辑',
          },
        ),
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

const processNodeColumns = [
  {
    type: 'selection',
    fixed: 'left',
    width: 30,
  },
  {
    title: '序号',
    key: 'no',
    width: 50,
    render: (_, index) => {
      return index + 1
    },
  },
  {
    title: '节点标题',
    key: 'title',
    render(row, index) {
      return h(
        NFormItem,
        {
          path: `processNodeList[${index}].title`,
          rule: {
            required: true,
            message: '请输入节点标题',
            trigger: ['blur', 'input'],
          },
        },
        [
          h(NInput, {
            value: row.title,
            placeholder: '请输入节点标题',
            type: 'textarea',
            onUpdateValue(v) {
              modalForm.value.processNodeList[index].title = v
            },
          }),
        ],
      )
    },
    width: 150,
  },
  {
    title: '节点描述',
    key: 'description',
    render(row, index) {
      return h(NInput, {
        value: row.description,
        placeholder: '请输入节点描述',
        type: 'textarea',
        onUpdateValue(v) {
          modalForm.value.processNodeList[index].description = v
        },
      })
    },
    width: 150,
  },
  {
    title: '节点审批人',
    key: 'approve_user_ids_arr',
    render(row, index) {
      return h(
        NFormItem,
        {
          path: `processNodeList[${index}].approve_user_ids_arr`,
          rule: {
            required: true,
            type: 'array',
            message: '请选择节点审批人',
            trigger: ['change'],
          },
        },
        [
          h(NSelect, {
            value: row.approve_user_ids_arr,
            multiple: true,
            maxTagCount: 'responsive',
            labelField: 'name',
            valueField: 'id',
            options: approveUserOptions.value,
            onUpdateValue(v) {
              const names = []
              const ids = []
              const filterArr = approveUserOptions.value.filter(ele =>
                v.includes(ele.id),
              )
              filterArr.forEach((item) => {
                names.push(item.name)
                ids.push(item.id)
              })
              modalForm.value.processNodeList[index].approve_user_ids_arr = ids
              modalForm.value.processNodeList[index].approve_user_ids
                = ids.join(',')
              modalForm.value.processNodeList[index].approve_user_names
                = names.join(',')
            },
          }),
        ],
      )
    },
    width: 150,
  },
  {
    title: '节点备注',
    key: 'remark',
    render(row, index) {
      return h(NInput, {
        value: row.remark,
        type: 'textarea',
        placeholder: '请输入节点备注',
        onUpdateValue(v) {
          modalForm.value.processNodeList[index].remark = v
        },
      })
    },
    width: 150,
  },
  {
    title: '操作',
    key: 'actions',
    width: 70,
    align: 'right',
    fixed: 'right',
    hideInExcel: true,
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            style: 'margin-left: 12px;',
            onClick: () => batchDeleteProcessNode([row.id || row.cId]),
          },
          {
            default: () => '删除',
          },
        ),
      ]
    },
  },
]

async function handleEnable(row) {
  row.enableLoading = true
  try {
    await api.edit_process_state({
      id: row.id,
      process_state: row.process_state === 1 ? 0 : 1,
    })
    row.enableLoading = false
    $message.success('操作成功')
    $table.value?.handleSearch()
  }
  catch (error) {
    console.error(error)
    row.enableLoading = false
  }
}

function processNodeCheckedKeysChange(keys) {
  processNodeCheckedKeys.value = keys
}

function refreshPNStatus() {
  processNodeContentStatus.value = modalForm.value.processNodeList.length
    ? 'success'
    : 'empty'
}

// 批量删除流程节点
function batchDeleteProcessNode(checkedRowKeys) {
  const delIndArr = []
  const delAjaxArr = []
  const { processNodeList } = modalForm.value
  processNodeList.forEach((ele, ind) => {
    if (checkedRowKeys.includes(ele.cId)) {
      delIndArr.push(ind)
    }
    if (checkedRowKeys.includes(ele.id)) {
      delIndArr.push(ind)
      delAjaxArr.push(ele.id)
    }
  })

  if (delAjaxArr.length) {
    const delKey = 'deleteProcessNode'
    $dialog.confirm({
      content: `确认删除流程节点？`,
      async confirm() {
        try {
          $message.loading('正在删除', { key: delKey })
          tableLoading.value = true
          await api.del_process_node(delAjaxArr.join(','))
          $message.success('删除成功', { key: delKey })
          tableLoading.value = false
        }
        catch (error) {
          console.error(error)
          $message.destroy(delKey)
          tableLoading.value = false
        }
      },
    })
  }
  modalForm.value.processNodeList = processNodeList.filter(
    (_, ind) => !delIndArr.includes(ind),
  )
}

function handleAddProcessNode() {
  const order = modalForm.value.processNodeList.length + 1
  modalForm.value.processNodeList.push({
    cId: uuidv4(),
    description: undefined,
    remark: undefined,
    order,
    approve_user_ids: undefined,
    approve_user_names: undefined,
    approve_user_ids_arr: [],
    is_original_node: 1,
  })
  refreshPNStatus()
}

// 打开弹窗
async function openModal() {
  processNodeContentStatus.value = 'empty'
  modalForm.value.processNodeList = []

  // 获取审核员列表
  const uRes = await api.get_approval_user()
  const uResData = uRes.data || []
  approveUserOptions.value = uResData

  if (modalAction.value === 'edit') {
    const mForm = toRaw(modalForm.value)
    if (mForm.id) {
      processNodeContentStatus.value = 'loading'
      const res = await api.get_process_node_by_id(mForm.id)
      const resData = res?.data || []
      if (resData.length) {
        const nList = resData.map((ele) => {
          const ids = []
          const names = []
          if (ele.approve_user_ids) {
            const arr = ele.approve_user_ids.split(',')
            approveUserOptions.value.forEach((item) => {
              if (arr.includes(item.id)) {
                ids.push(item.id)
                names.push(item.name)
              }
            })
          }
          ele.approve_user_ids = ids.join(',')
          ele.approve_user_names = names.join(',')
          return ele
        })
        modalForm.value.processNodeList = nList
      }
      processNodeContentStatus.value = resData?.length ? 'success' : 'empty'
    }
  }
}
</script>

<style>
.borderGray {
  border: solid 1px #e3e3e3;
  border-radius: 10px;
  overflow: hidden;
}
</style>
