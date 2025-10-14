<template>
  <MeModal
    ref="modalRef"
    title="查看流程"
    width="700px"
    :content-status="contentStatus"
  >
    <div class="max-h-[70vh] overflow-y-scroll">
      <MeContanier class-type="" title="流程信息" content-class="pt-16px px-2">
        <div v-if="processList.length">
          <n-steps vertical :current="current" :status="currentStatus">
            <n-step
              v-for="(item, index) in processList"
              :key="index"
              :title="item.title"
              :description="item.description"
            >
              <template #default>
                <div :class="current === index + 1 ? 'text-gray' : ''">
                  <div>目的：{{ item.description }}</div>

                  <div>备注：{{ item.remark }}</div>

                  <div v-if="item.pn_state !== undefined">
                    状态：{{ pnStateObj[item.pn_state] }}
                  </div>

                  <div v-if="!(item.ap_by || item.anp_by)">
                    待审批人：{{ item.approve_user_names }}
                  </div>

                  <div v-if="item.ap_by">
                    <div>审批通过人：{{ item.ap_by }}</div>
                    <div>审批通过备注：{{ item.ap_remark }}</div>
                    <div>审批通过时间：{{ item.ap_time }}</div>
                  </div>
                  <div v-if="item.anp_by">
                    <div>审批不通过人：{{ item.anp_by }}</div>
                    <div>审批不通过备注：{{ item.anp_remark }}</div>
                    <div>审批不通过时间：{{ item.anp_time }}</div>
                  </div>
                </div>
              </template>
            </n-step>
          </n-steps>
        </div>
        <MeEmpty v-else />
      </MeContanier>

      <MeContanier
        v-if="currentStatus != 'error' && showApprovalBtn"
        class-type=""
        title="审批备注"
        content-class="pt-16px px-2"
      >
        <n-form
          ref="modalFormRef"
          label-placement="left"
          label-align="left"
          :label-width="100"
          :model="modalForm"
        >
          <n-form-item
            label="备注"
            path="remark"
            :rule="{
              required: true,
              message: '请输入审批备注',
              trigger: ['input', 'blur'],
            }"
          >
            <n-input
              v-model:value="modalForm.remark"
              clearable
              type="textarea"
              :maxlength="200"
              show-count
              placeholder="请输入备注"
            />
          </n-form-item>
        </n-form>
      </MeContanier>
    </div>

    <template #footer>
      <footer class="flex justify-end">
        <n-button @click="handleCancel()">
          取消
        </n-button>
        <n-button
          v-if="currentStatus != 'error' && showApprovalBtn"
          type="error"
          :loading="noPassBtnLoading"
          class="ml-20"
          @click="handleApproval('noPass')"
        >
          不通过
        </n-button>
        <n-button
          v-if="currentStatus != 'error' && showApprovalBtn"
          type="primary"
          :loading="passBtnLoading"
          class="ml-20"
          @click="handleApproval('pass')"
        >
          通过
        </n-button>
      </footer>
    </template>
  </MeModal>
</template>

<script setup>
import { MeContanier, MeEmpty, MeModal } from '@/components'
import { useForm, useModal } from '@/composables'
import { useUserStore } from '@/store'
import { computed, toRaw } from 'vue'
import api from '../api'

defineOptions({ name: 'QueryProcessModal' })
const emit = defineEmits(['success'])

const userStore = useUserStore()

const processList = ref([])
const currentStatus = ref('process')
const current = ref(1)
const contentStatus = ref('empty')

const passBtnLoading = ref(false)
const noPassBtnLoading = ref(false)
const editRow = ref(null)

const [modalRef] = useModal()
const [modalFormRef, modalForm] = useForm()

const pnStateObj = {
  0: '已作废',
  1: '待审批',
  2: '审批通过',
  3: '审批拒绝',
}

const showApprovalBtn = computed(() => {
  if (processList.value.length) {
    const cpNode = processList.value[current.value - 1]
    const idsStr = cpNode?.approve_user_ids || ''
    const { userId: uId, currentRole: role } = userStore
    const arr = idsStr?.split(',') || []
    return arr.includes(String(uId)) || role === '管理员'
  }
  else {
    return false
  }
})

async function handleOpen(options = {}) {
  const { row, ...rest } = options

  modalForm.value = {}
  editRow.value = row
  modalRef.value.open({ ...rest, onOk: onSave })
  row?.id && (await getWorkOrderProcess(row.id))
}

async function getWorkOrderProcess(woId) {
  contentStatus.value = 'loading'
  const res = await api.get_work_order_process({
    woId,
  })
  const resData = res?.data || []
  processList.value = resData
  currentStatus.value = 'process'
  const findInd = resData.findIndex((ele) => {
    if (ele.pn_state === 3) {
      currentStatus.value = 'error'
      return true
    }
    return [0, 1].includes(ele.pn_state)
  })

  current.value = findInd + 1
  contentStatus.value = resData.length ? 'success' : 'empty'
}

async function onSave() {
  await validation()
  okLoading.value = true
  try {
    const data = toRaw(modalForm.value)
    const res = await api.addInfoDict(data)
    $message.success(res?.message)
    emit('success')
  }
  catch (error) {
    console.error(error)
    return false
  }
  finally {
    okLoading.value = false
  }
}

function handleCancel() {
  modalRef.value.close()
}

function handleApproval(type) {
  if (type === 'pass' && !modalForm.remark) {
    modalForm.value.remark = '同意'
  }
  modalFormRef.value.validate(async (errs) => {
    if (!errs) {
      try {
        const data = toRaw(modalForm.value)
        const cProcessNode = processList.value[current.value - 1]
        const res = await api.approval_process_node({
          id: cProcessNode.id,
          user_id: userStore.userId,
          type,
          remark: data.remark,
        })
        $message.success(res?.message)
        emit('success')
        handleCancel()
      }
      catch (err) {
        return false
      }
      finally {
      }
    }
  })
}

defineExpose({
  handleOpen,
})
</script>

<style>
.css{
  align-items: stretch;
  justify-content: space-between;

}
</style>