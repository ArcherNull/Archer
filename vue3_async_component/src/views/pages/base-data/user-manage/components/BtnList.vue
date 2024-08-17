<template>
  <div class="BtnList">
    <el-button
      v-for="(item, index) in btnList"
      :key="index"
      :type="item.type"
      @click="clickFun(item)"
    >
      {{ item.btnText }}
    </el-button>
  </div>
</template>

<!-- eslint-disable no-unused-vars -->
<script setup>
import {
  defineEmits,
  defineProps
} from 'vue'
const props = defineProps({
  btnList: Array
})

const emit = defineEmits(['handleClick'])

const clickFun = (item) => {
  emit('handleClick', item)
}
</script>

