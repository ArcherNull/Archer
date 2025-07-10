<template>
  <div class="SearchBox">
    <el-input
      v-model="searchData"
      placeholder="请输入"
      class="input-with-select"
      @input="onInpuut"
    >
      <template #append>
        <el-button :icon="Search" @click="searchFun" />
      </template>
    </el-input>
  </div>
</template>

<!-- eslint-disable no-unused-vars -->
<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import {
  defineEmits,
  defineProps
} from 'vue'

const props = defineProps({
  searchData: String
})

const emit = defineEmits(['search', 'update:searchData'])

const searchFun = () => {
  emit('search')
}

const onInpuut = (ele) => {
  emit('update:modelValue', ele)
}
</script>

