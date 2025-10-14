<!--
 * @Author: Null
 * @Date: 2022-08-23 16:51:22
 * @Description: el-button 按钮
-->
<template>
  <div class="MyButton">
    <el-button :loading="loading" :type="type" @click="clickFun">
      <slot>
        {{ btnText }}
      </slot>
    </el-button>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useElButtonStore } from '@/store/element/elButton.js'

export default defineComponent({
  name: 'MyButton',
  props: {
    // 按钮loading
    loading: {
      type: Boolean,
      default: false
    },
    // 按钮名称
    btnText: {
      type: String,
      default: '按钮'
    },
    // 按钮类型
    type: {
      type: String,
      default: 'primary'
    }
  },
  setup (props, context) {
    const { btnText } = props

    console.log('useElButtonStore', useElButtonStore)

    const store = useElButtonStore()

    console.log('store', store)

    const clickFun = () => {
      context.emit('clickFun', btnText)
    }
    return {
      clickFun,
      store
    }
  }
})
</script>

