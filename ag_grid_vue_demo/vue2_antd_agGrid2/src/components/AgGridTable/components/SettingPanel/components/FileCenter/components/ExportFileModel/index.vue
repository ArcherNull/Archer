<template>
  <BLModal
    title="导出"
    :visible="visible"
    :ok-button-props="{ htmlType: 'submit' }"
    width="700px"
    :zIndex="1031"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <div class="uploadBox">113123</div>
  </BLModal>
</template>

<script>
export default {
  name: 'ExportFileModel',
  props: {
    // 弹窗显示隐藏
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {}
  },
  methods: {
    handleCancel() {
      this.$emit('update:visible', false)
    },
    // 提交表单
    handleSubmit() {}
  }
}
</script>
