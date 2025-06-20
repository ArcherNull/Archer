<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-05-08 13:44:32
 * @LastEditTime: 2025-05-08 19:34:25
 * @Description:
-->
<template>
  <div style="border: 1px solid #ccc">
    <!-- 工具栏 -->
    <Toolbar
      :editor="editorRef"
      :default-config="toolbarConfig"
      style="border-bottom: 1px solid #ccc"
    />
    <!-- 编辑器 -->
    <Editor
      v-bind="attrs"
      :default-config="editorConfig"
      :style="attrs.style || 'height: 350px; overflow-y: hidden;'"
      @on-created="handleCreated"
    />
  </div>
</template>

<script setup>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { defineExpose, defineOptions, onBeforeUnmount, shallowRef, useAttrs } from 'vue'
import '@wangeditor/editor/dist/css/style.css'

defineOptions({
  // 是否使得组件自动地继承 attribute
  inheritAttrs: false,
})

// 编辑器实例，必须用 shallowRef，重要！
const editorRef = shallowRef()

const attrs = useAttrs()

const toolbarConfig = {}

// 编辑器配置
const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: { },
}

function handleCreated(editor) {
  editorRef.value = editor
}

// 组件销毁时，及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null)
    return
  editor.destroy()
})

defineExpose({
  editorRef,
})
</script>

<style>
.w-e-full-screen-container {
  z-index: 1100;
}
</style>
