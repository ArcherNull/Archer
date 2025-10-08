<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-10-17 15:22:10
 * @LastEditTime: 2025-02-25 09:41:59
 * @Description: 
-->
<script setup name="PersonalCenter">
import { ref } from 'vue';

const dialogVisible = ref(false);
const dialogImageUrl = ref('');

// 上传
function handleChange(file, fileList) {
  this.fileList = fileList;
  this.hideUpload = this.fileList.length >= this.limitCount;
}
// 移除
function handleRemove(file) {
  console.log(file);
  /*
            移除文件，重新设置  fileList ，编写处理方法
            this.fileList = ？？？
         */
  this.hideUpload = this.fileList.length >= this.limitCount;
}
// 预览
function handlePictureCardPreview(file) {
  this.dialogImageUrl = file.url;
  this.dialogVisible = true;
}
// 下载
function handleDownload(file) {
  console.log(file);
}
</script>

<template>
  <el-upload
    :auto-upload="false"
    :class="{ hide: hideUpload }"
    :file-list="fileList"
    :limit="limitCount"
    :on-change="handleChange"
    accept=".jpg, .jpeg, .png"
    action="#"
    list-type="picture-card"
  >
    <template #default>
      <i class="el-icon-plus"></i>
    </template>
    <template #file="{ file }">
      <div>
        <img :src="file.url" alt="" class="el-upload-list__item-thumbnail" />
        <span class="el-upload-list__item-actions">
          <span
            class="el-upload-list__item-preview"
            @click="handlePictureCardPreview(file)"
          >
            <i class="el-icon-zoom-in"></i>
          </span>
          <span
            v-if="!disabled"
            class="el-upload-list__item-delete"
            @click="handleDownload(file)"
          >
            <i class="el-icon-download"></i>
          </span>
          <span
            v-if="!disabled"
            class="el-upload-list__item-delete"
            @click="handleRemove(file)"
          >
            <i class="el-icon-delete"></i>
          </span>
        </span>
      </div>
    </template>
  </el-upload>

  <!-- 预览弹窗 -->
  <el-dialog v-model:visible="dialogVisible">
    <img :src="dialogImageUrl" alt="" width="100%" />
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep (.hide .el-upload--picture-card) {
  display: none;
}
</style>
