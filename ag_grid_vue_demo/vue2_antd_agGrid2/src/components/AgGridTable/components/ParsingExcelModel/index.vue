<template>
  <BLModal
    title="解析Excel"
    :visible="visible"
    :ok-button-props="{ htmlType: 'submit' }"
    width="700px"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <ParsingExcel></ParsingExcel>
  </BLModal>
</template>

<script>
import ParsingExcel from "./ParsingExcel/index.vue";

export default {
  name: "ParsingExcelModel",
  components: {
    ParsingExcel,
  },
  props: {
    // 弹窗显示隐藏
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {

    };
  },

  methods: {
    handleCancel() {
      this.$emit("update:visible", false);
    },
    // 提交表单
    handleSubmit() {},
  },
};
</script>
