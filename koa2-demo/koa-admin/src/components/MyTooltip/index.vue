<!--
 * @Author: Null
 * @Date: 2022-08-26 14:41:33
 * @Description: el-tooltip 提示文本
-->
<template>
  <el-tooltip
    class="MyTooltip"
    :content="content"
    :placement="placement"
    :effect="effect"
  >
    <slot></slot>>
  </el-tooltip>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MyTooltip',
  props: {
    // 位置
    placement: {
      type: String,
      default: 'bottom'
    },
    // 主题
    effect: {
      type: String,
      default: 'dark'
    },
    // 内容
    content: {
      type: String,
      required: true,
      default: 'MyTooltip'
    }
  },
  setup (props) {

  }
})
</script>
