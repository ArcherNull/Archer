<!--
 * @Author: Null
 * @Date: 2022-10-17 14:10:29
 * @Description: 下拉菜单
-->
<template>
  <el-dropdown
    :id="item.name"
    ref="dropdownRef"
    trigger="contextmenu"
    class="MenuBox"
    @visible-change="handleChange($event, item.name)"
  >
    <span :class="tabValue === item.name ? 'label' : ''">{{ item.title }}</span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="removeTab(item.name)">
          <el-icon><Close /></el-icon>关闭当前标签页
        </el-dropdown-item>
        <el-dropdown-item
          v-if="isShowMenu(item.name, 'left')"
          @click="removeTab(item.name, 'left')"
        >
          <el-icon><DArrowLeft /></el-icon>关闭左侧标签页
        </el-dropdown-item>
        <el-dropdown-item
          v-if="isShowMenu(item.name, 'right')"
          @click="removeTab(item.name, 'right')"
        >
          <el-icon><DArrowRight /></el-icon>关闭右侧标签页
        </el-dropdown-item>
        <el-dropdown-item
          v-if="tagViewsList.length > 1"
          @click="removeTab(item.name, 'other')"
        >
          <el-icon><Operation /></el-icon>关闭其他标签页
        </el-dropdown-item>
        <el-dropdown-item @click="removeTab(item.name, 'all')">
          <el-icon><Minus /></el-icon>关闭全部标签页
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script>
import { ref } from 'vue'
import {
  DArrowLeft,
  DArrowRight,
  Operation,
  Minus
} from '@element-plus/icons-vue'

export default {
  name: 'MenuBox',
  components: {
    DArrowLeft,
    DArrowRight,
    Operation,
    Minus
  },
  props: {
    tagViewsList: {
      type: Array,
      default: () => []
    },
    item: {
      type: Object,
      default: () => {}
    }
  },
  setup (props, context) {
    const dropdownRef = ref(null)

    const isShowMenu = (name, type) => {
      const index = props.tagViewsList.findIndex((item) => name === item.name)
      return type === 'left'
        ? index !== 0
        : index !== props.tagViewsList.length - 1
    }

    const handleChange = (visible, name) => {
      if (!visible) return
      dropdownRef.value.forEach((item) => {
        if (item.id === name) return
        item.handleClose()
      })
    }
    return {
      isShowMenu,
      handleChange,
      dropdownRef
    }
  }
}
</script>

<style lang="scss" scoped>
.MenuBox {
  .label {
    color: var(--el-color-primary); //激活标签页高亮
  }
  :deep(.el-tabs__item) {
    &:hover {
      span {
        color: var(--el-color-primary); //鼠标移到标签页高亮
      }
    }
    .el-dropdown {
      line-height: inherit; // 统一标签页显示名称行高
    }
  }
}
</style>
