<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-06 14:40:26
 * @LastEditTime: 2024-09-06 15:36:28
 * @Description:
-->
<template>
  <BLModal
    title="解析Excel"
    :visible="visible"
    :ok-button-props="{ htmlType: 'submit' }"
    width="700px"
    :zIndex="1031"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <div class="uploadBox">
      <div class="header">
        <a-form layout="inline">
          <a-form-item label="解析方式">
            <a-radio-group v-model="parseType">
              <a-radio value="uploadAndParse">上传到服务器解析</a-radio>
              <a-radio value="frontParse">前端解析</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-form>
      </div>
      <div class="upload">
        <ParsingExcel :parseType="parseType"></ParsingExcel>
      </div>
    </div>
  </BLModal>
</template>

<script>
import ParsingExcel from './ParsingExcel/index.vue'

export default {
  name: 'ParsingExcelModel',
  components: {
    ParsingExcel
  },
  props: {
    // 弹窗显示隐藏
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      parseType: 'uploadAndParse'
    }
  },
  watch: {
    visible: function (newVal) {
      if (newVal) {
        this.parseType = 'uploadAndParse'
      }
    }
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

<style lang="less" scoped>
.uploadBox {
  .header {
    margin-bottom: 10px;
  }
}
</style>
