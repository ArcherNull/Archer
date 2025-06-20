<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-04-16 11:40:21
 * @LastEditTime: 2025-06-20 14:25:04
 * @Description:
-->

<template>
  <CommonPage>
    <template #action>
      <NButton type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        发送邮件
      </NButton>
    </template>

    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1400"
      :columns="columns"
      :is-pagination="false"
      :get-data="api.read"
      :expand="true"
    >
      <MeQueryItem label="接收者" :label-width="70">
        <n-input
          v-model:value="queryItems.receiver"
          type="text"
          placeholder="请输入接收者"
          clearable
        />
      </MeQueryItem>
      <MeQueryItem label="接收者邮箱" :label-width="80">
        <n-input
          v-model:value="queryItems.receiver_email"
          type="text"
          placeholder="请输入接收者邮箱"
          clearable
        />
      </MeQueryItem>

      <MeQueryItem label="邮箱类型" :label-width="70">
        <n-select
          v-model:value="queryItems.type"
          :options="typeOptions"
          clearable
          placeholder="请选择邮箱类型"
          filterable
        />
      </MeQueryItem>

      <MeQueryItem label="发送状态" :label-width="70">
        <n-select
          v-model:value="queryItems.state"
          :options="stateOptions"
          clearable
          placeholder="请选择发送状态"
          filterable
        />
      </MeQueryItem>
    </MeCrud>

    <MeModal ref="modalRef" width="1000px">
      <div class="max-h-[70vh] overflow-y-scroll">
        <n-form
          ref="modalFormRef"
          label-placement="left"
          label-align="right"
          :label-width="120"
          :model="modalForm"
          :disabled="modalAction === 'view'"
        >
          <n-grid :span="24" :x-gap="24">
            <n-form-item-gi
              :span="12"
              label="发送者邮箱"
              path="sender_email"
              :rule="{
                required: true,
                message: '请输入发送者邮箱',
                trigger: ['change'],
              }"
            >
              <n-select
                v-model:value="modalForm.sender_email"
                :options="senderEmailOptions"
                clearable
                filterable
                @change="senderEmailChange"
              />
            </n-form-item-gi>

            <n-form-item-gi
              :span="12"
              label="发送者名称"
              path="sender"
              :rule="{
                required: true,
                message: '请输入发送者名称',
                trigger: ['input', 'blur'],
              }"
            >
              <n-input v-model:value="modalForm.sender" disabled />
            </n-form-item-gi>
          </n-grid>

          <n-grid :span="24" :x-gap="24">
            <n-form-item-gi
              :span="12"
              label="接收者名称"
              path="receivers"
              :rule="{
                required: true,
                message: '请输入接收者名称',
                trigger: ['input', 'blur'],
              }"
            >
              <n-input v-model:value="modalForm.receivers" placeholder="请输入接收者名称" />
            </n-form-item-gi>

            <n-form-item-gi
              :span="12"
              label="接收者邮箱"
              path="receiver_emails"
              :rule="{
                required: true,
                validator: emailValidator,
                trigger: ['input', 'blur'],
              }"
            >
              <n-input v-model:value="modalForm.receiver_emails" placeholder="请输入接收者邮箱" />
            </n-form-item-gi>
          </n-grid>

          <n-grid :span="24" :x-gap="24">
            <n-form-item-gi
              :span="12" label="邮箱类型" path="type"
              :rule="{
                required: true,
                message: '请选择邮箱类型',
                trigger: ['change'],
              }"
            >
              <n-select
                v-model:value="modalForm.type"
                :options="typeOptions"
                clearable
                placeholder="请选择邮箱类型"
                filterable
              />
            </n-form-item-gi>

            <n-form-item-gi
              :span="12"
              label="主题"
              path="title"
              :rule="{
                required: true,
                message: '请输入主题',
                trigger: ['input', 'blur'],
              }"
            >
              <n-input v-model:value="modalForm.title" placeholder="请输入主题" maxlength="100" show-count clearable />
            </n-form-item-gi>
          </n-grid>

          <n-form-item
            label="内容"
            path="content"
            :rule="{
              required: true,
              message: '请输入内容',
              validator: contentValidator,
              trigger: ['input', 'blur'],
            }"
          >
            <MeEditor v-model="modalForm.content" />
          </n-form-item>
        </n-form>
      </div>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { MeCrud, MeEditor, MeModal, MeQueryItem } from '@/components'
import { useCrud } from '@/composables'
import { removeHTMLTags } from '@/utils/common'
import { NButton, NTag } from 'naive-ui'
import api from './api'

defineOptions({ name: 'UserMgt' })

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})

onMounted(() => {
  $table.value?.handleSearch()
})

const typeOptions = ref([])

// const typeOptions = [
//   {
//     label: '流程审批提醒',
//     value: 'process_approval_reminder',
//   },
//   {
//     label: '自定义',
//     value: 'custom',
//   },
//   {
//     label: '宣传',
//     value: 'publicity',
//   },
// ]

const stateOptions = [
  {
    label: '已删除',
    value: 0,
  },
  {
    label: '待发送',
    value: 1,
  },
  {
    label: '发送成功',
    value: 2,
  },
  {
    label: '发送失败',
    value: 3,
  },
]

// 发送者邮箱下拉列表
const senderEmailOptions = ref([])

function contentValidator(rule, value) {
  if (!value) {
    return new Error('请输入内容')
  }
  else {
    const val = removeHTMLTags(value)
    if (!val) {
      return new Error('请输入内容')
    }
  }
  return true
}

function emailValidator(rule, value) {
  if (value) {
    const reg = /^[A-Z0-9\u4E00-\u9FA5]+@[\w-]+(\.[\w-]+)+$/i
    if (reg.test(value)) {
      return true
    }
    else {
      return new Error('请输入正确格式的邮箱')
    }
  }
  else {
    return new Error('请输入邮箱')
  }
}

function refreshTable() {
  $table.value?.handleSearch()
}

const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleEdit,
  handleDelete,
} = useCrud({
  name: '邮箱内容',
  initForm: { state: 1 },
  doCreate: api.create,
  doDelete: api.delete,
  doUpdate: api.update,
  refresh: refreshTable,
})

const columns = [
  { title: '发送者名称', key: 'sender', width: 150 },
  {
    title: '发送者邮箱',
    key: 'sender_email',
    width: 150,
  },
  { title: '接收者名称', key: 'receiver', width: 150 },
  {
    title: '接收者邮箱',
    key: 'receiver_email',
    width: 150,
  },
  {
    title: '邮箱类型',
    key: 'type',
    width: 100,
  },
  {
    title: '主题',
    key: 'title',
    width: 120,
  },
  {
    title: '主要内容',
    key: 'content',
    width: 180,
  },
  {
    title: '附件',
    key: 'files',
    width: 150,
  },
  { title: '备注', key: 'remark', width: 120 },

  {
    title: '状态',
    key: 'state',
    width: 100,
    render: (row) => {
      const { state } = row
      const stateProxy = {
        0: {
          text: '已删除',
          type: 'error',
        },
        1: {
          text: '待发送',
          type: 'info',
        },
        2: {
          text: '发送成功',
          type: 'success',
        },
        3: {
          text: '发送失败',
          type: 'warning',
        },
      }
      const obj = stateProxy[state]

      return h(
        NTag,
        {
          type: obj.type,
        },
        {
          default: obj.text,
        },
      )
    },
  },
  { title: '发送时间', key: 'send_time', width: 160 },
  { title: '更新人', key: 'updated_by', width: 100 },
  { title: '更新时间', key: 'updated_at', width: 160 },
  { title: '创建人', key: 'created_by', width: 100 },
  { title: '创建时间', key: 'created_at', width: 160 },

  {
    title: '操作',
    key: 'actions',
    width: 180,
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
            type: 'primary',
            secondary: true,
            style: 'margin-left: 12px;',
            onClick: () => handleReSend(row.id),
          },
          {
            default: () => '重新发送',
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

// 重新发送
function handleReSend(id) {
  if (id) {
    const d = $dialog.warning({
      content: '确定重新发送吗？',
      title: '提示',
      positiveText: '确定',
      negativeText: '取消',
      async onPositiveClick() {
        try {
          d.loading = true
          const refPro = new Promise((resolve) => {
            setTimeout(() => {
              resolve(true)
            }, 250)
          })
          await refPro(id)
          $message.success('删除成功')
          d.loading = false
          refreshTable()
        }
        catch (error) {
          console.error(error)
          d.loading = false
        }
      },
    })
  }
  else {
    $message.warning('缺少id，重新发送失败')
  }
}

// 获取可发送邮箱列表
async function getSendEmailList() {
  const res = await api.getSendEmailList({})
  const resData = res?.data || {}
  const { email_type_list, send_email_list } = resData
  senderEmailOptions.value = send_email_list.map((ele) => {
    ele.label = ele.sender_email
    ele.value = ele.sender_email
    return ele
  })
  typeOptions.value = email_type_list
}

getSendEmailList()

function senderEmailChange(ele) {
  const findItem = senderEmailOptions.value.find(item => item.value === ele)
  modalForm.value.sender = findItem?.sender_name
}
</script>

<!-- 别忘了引入样式 -->
<style src="@wangeditor/editor/dist/css/style.css"></style>
