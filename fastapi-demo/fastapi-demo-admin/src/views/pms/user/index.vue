<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-04-16 11:40:21
 * @LastEditTime: 2025-07-12 16:18:59
 * @Description:
-->

<template>
  <CommonPage>
    <template #action>
      <div class="flex justify-end gap-10">
        <NButton type="primary" @click="importTemplate()">
          获取导入模板
        </NButton>
        <NButton type="primary" @click="handleImport()">
          导入
        </NButton>
        <NButton type="primary" @click="handleExport()">
          导出
        </NButton>
        <NButton type="primary" @click="handleAdd()">
          <i class="i-material-symbols:add mr-4 text-18" />
          创建新用户
        </NButton>
      </div>
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
      <MeQueryItem label="用户名" :label-width="50">
        <n-input
          v-model:value="queryItems.name"
          type="text"
          placeholder="请输入用户名"
          clearable
        />
      </MeQueryItem>

      <MeQueryItem label="用户昵称" :label-width="70">
        <n-input
          v-model:value="queryItems.nick_name"
          type="text"
          placeholder="请输入用户昵称"
          clearable
        />
      </MeQueryItem>

      <MeQueryItem label="邮箱" :label-width="50">
        <n-input
          v-model:value="queryItems.email"
          type="text"
          placeholder="请输入邮箱"
          clearable
        />
      </MeQueryItem>

      <MeQueryItem label="角色" :label-width="50">
        <n-select
          v-model:value="queryItems.role"
          :options="rolesOptions"
          clearable
          placeholder="请选择角色"
          filterable
        />
      </MeQueryItem>

      <MeQueryItem label="状态" :label-width="50">
        <n-select
          v-model:value="queryItems.state"
          :options="stateOptions"
          clearable
          placeholder="请选择状态"
          filterable
        />
      </MeQueryItem>
    </MeCrud>

    <MeModal ref="modalRef" width="520px">
      <n-form
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="80"
        :model="modalForm"
        :disabled="modalAction === 'view'"
      >
        <n-form-item
          label="用户名"
          path="name"
          :rule="{
            required: true,
            message: '请输入用户名',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input
            v-model:value="modalForm.name"
            :disabled="modalAction !== 'add'"
          />
        </n-form-item>

        <n-form-item
          label="用户昵称"
          path="nick_name"
          :rule="{
            required: false,
            message: '请输入用户昵称',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.nick_name" />
        </n-form-item>

        <n-form-item
          label="邮箱"
          path="email"
          :rule="{
            required: true,
            message: '请输入用户名',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input
            v-model:value="modalForm.email"
            :disabled="modalAction !== 'add'"
          />
        </n-form-item>

        <n-form-item
          v-if="['add'].includes(modalAction)"
          label="初始密码"
          path="password"
          :rule="{
            required: true,
            message: '请输入密码',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input
            v-model:value="modalForm.password"
            clearable
            :maxlength="40"
            show-count
            default-value="123456"
            type="password"
            show-password-on="mousedown"
          />
        </n-form-item>

        <n-form-item label="角色" path="role">
          <n-select
            v-model:value="modalForm.role"
            :options="rolesOptions"
            clearable
            filterable
          />
        </n-form-item>

        <n-form-item label="性别" path="sex">
          <n-select
            v-model:value="modalForm.sex"
            :options="sexOptions"
            clearable
            filterable
          />
        </n-form-item>

        <n-form-item label="用户生日" path="birthday">
          <n-date-picker
            v-model:formatted-value="modalForm.birthday"
            type="date"
            clearable
            value-format="yyyy-MM-dd"
            placeholder="请选择生日"
          />
        </n-form-item>

        <n-form-item label="状态" path="state">
          <NSwitch
            v-model:value="modalForm.state"
            :checked-value="1"
            :unchecked-value="0"
            :default-value="1"
          >
            <template #checked>
              启用
            </template>
            <template #unchecked>
              停用
            </template>
          </NSwitch>
        </n-form-item>
      </n-form>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { download } from '@/api/public'
import { MeCrud, MeModal, MeQueryItem } from '@/components'
import { useCrud } from '@/composables'
import { NButton, NSwitch, NTag } from 'naive-ui'
import api from './api'

defineOptions({ name: 'UserMgt' })

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})

const sexOptions = [
  {
    label: '男',
    value: '0',
  },
  {
    label: '女',
    value: '1',
  },
  {
    label: '未知',
    value: '2',
  },
]

onMounted(() => {
  $table.value?.handleSearch()
})

const rolesOptions = [
  {
    label: '审核员',
    value: '审核员',
  },
  {
    label: '员工',
    value: '员工',
  },
  {
    label: '司机',
    value: '司机',
  },
  {
    label: '管理员',
    value: '管理员',
  },
]

const stateOptions = [
  {
    label: '禁用',
    value: 0,
  },
  {
    label: '启用',
    value: 1,
  },
]

const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleEdit,
  handleDelete,
} = useCrud({
  name: '用户',
  initForm: { state: 1 },
  doCreate: api.create,
  doDelete: api.delete,
  doUpdate: api.update,
  refresh: () => $table.value?.handleSearch(),
})

const columns = [
  { title: '用户名', key: 'name', width: 150, ellipsis: { tooltip: true } },
  {
    title: '用户昵称',
    key: 'nick_name',
    width: 150,
    ellipsis: { tooltip: true },
  },
  {
    title: '角色',
    key: 'role',
    width: 120,
  },
  { title: '邮箱', key: 'email', width: 150, ellipsis: { tooltip: true } },

  { title: '性别', key: 'sex', width: 120, render: (row) => {
    const sex = row.sex
    const findItem = sexOptions.find(item => item.value === sex)
    return findItem?.label || ''
  } },
  { title: '生日', key: 'birthday', width: 150, ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'state',
    width: 100,
    render: row =>
      h(
        NTag,
        {
          type: row.state === 0 ? 'error' : 'success',
        },
        {
          default: () => (row.state === 0 ? '禁用' : '启用'),
        },
      ),
  },
  { title: '更新时间', key: 'updated_at', width: 160 },
  { title: '创建时间', key: 'created_at', width: 160 },

  {
    title: '操作',
    key: 'actions',
    width: 120,
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

// 导出
function handleExport() {
  console.log('导出=====>')
}

// 导入
function handleImport() {
  console.log('导入=====>')
}

// 获取导入模板
function importTemplate() {
  console.log('获取导入模板=====>')
  download(
    '/user/importTemplate',
    {},
    `user_template_${new Date().getTime()}.xlsx`,
  )
}
</script>
