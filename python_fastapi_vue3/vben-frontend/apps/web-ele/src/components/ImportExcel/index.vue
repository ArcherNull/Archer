<script setup lang="ts" name="ImportExcel">
import type { UploadRawFile, UploadRequestOptions } from 'element-plus';

import { defineExpose, ref } from 'vue';

import { Download } from '@element-plus/icons-vue';
import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElIcon,
  ElNotification,
  ElSwitch,
  ElUpload,
} from 'element-plus';

import { useDownload } from '#/comm/hooks/useDownload';

export interface ExcelParameterProps {
  title: string; // 标题
  fileSize?: number; // 上传文件的大小
  fileType?: File.ExcelMimeType[]; // 上传文件的类型
  tempApi?: (params: any) => Promise<any>; // 下载模板的Api
  importApi?: (params: any) => Promise<any>; // 批量导入的Api
  getTableList?: () => void; // 获取表格数据的Api
}

// 是否覆盖数据
const isCover = ref(false);
// 最大文件上传数
const excelLimit = ref(1);
// dialog状态
const dialogVisible = ref(false);
// 父组件传过来的参数
const parameter = ref<ExcelParameterProps>({
  fileSize: 5,
  fileType: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  title: '',
});

// 接收父组件参数
const handleOpen = (params: ExcelParameterProps) => {
  parameter.value = { ...parameter.value, ...params };
  dialogVisible.value = true;
};

// Excel 导入模板下载
const downloadTemp = () => {
  if (!parameter.value.tempApi) return;
  useDownload(parameter.value.tempApi, `${parameter.value.title}模板`);
};

// 文件上传
const uploadExcel = async (param: UploadRequestOptions) => {
  const excelFormData = new FormData();
  excelFormData.append('file', param.file);
  excelFormData.append('isCover', isCover.value as unknown as Blob);
  await parameter.value.importApi!(excelFormData);
  parameter.value.getTableList && parameter.value.getTableList();
  dialogVisible.value = false;
};

/**
 * @description 文件上传之前判断
 * @param file 上传的文件
 */
const beforeExcelUpload = (file: UploadRawFile) => {
  const isExcel = parameter.value.fileType!.includes(
    file.type as File.ExcelMimeType,
  );
  const fileSize = file.size / 1024 / 1024 < parameter.value.fileSize!;
  if (!isExcel)
    ElNotification({
      message: '上传文件只能是 xls / xlsx 格式！',
      title: '温馨提示',
      type: 'warning',
    });
  if (!fileSize)
    setTimeout(() => {
      ElNotification({
        message: `上传文件大小不能超过 ${parameter.value.fileSize}MB！`,
        title: '温馨提示',
        type: 'warning',
      });
    }, 0);
  return isExcel && fileSize;
};

// 文件数超出提示
const handleExceed = () => {
  ElNotification({
    message: '最多只能上传一个文件！',
    title: '温馨提示',
    type: 'warning',
  });
};

// 上传错误提示
const excelUploadError = () => {
  ElNotification({
    message: `批量添加${parameter.value.title}失败，请您重新上传！`,
    title: '温馨提示',
    type: 'error',
  });
};

// 上传成功提示
const excelUploadSuccess = () => {
  ElNotification({
    message: `批量添加${parameter.value.title}成功！`,
    title: '温馨提示',
    type: 'success',
  });
};

defineExpose({
  handleOpen,
});
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    :destroy-on-close="true"
    :title="`批量添加${parameter.title}`"
    draggable
    width="580px"
  >
    <ElForm class="drawer-multiColumn-form" label-width="100px">
      <ElFormItem label="模板下载 :">
        <ElButton :icon="Download" type="primary" @click="downloadTemp">
          点击下载
        </ElButton>
      </ElFormItem>
      <ElFormItem label="文件上传 :">
        <ElUpload
          :accept="parameter.fileType!.join(',')"
          :before-upload="beforeExcelUpload"
          :drag="true"
          :http-request="uploadExcel"
          :limit="excelLimit"
          :multiple="true"
          :on-error="excelUploadError"
          :on-exceed="handleExceed"
          :on-success="excelUploadSuccess"
          :show-file-list="true"
          action="#"
          class="upload"
        >
          <slot name="empty">
            <ElIcon class="el-icon--upload">
              <upload-filled />
            </ElIcon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
          </slot>
          <template #tip>
            <slot name="tip">
              <div class="el-upload__tip">
                请上传 .xls , .xlsx 标准格式文件，文件最大为
                {{ parameter.fileSize }}M
              </div>
            </slot>
          </template>
        </ElUpload>
      </ElFormItem>
      <ElFormItem label="数据覆盖 :">
        <ElSwitch v-model="isCover" />
      </ElFormItem>
    </ElForm>
  </ElDialog>
</template>
<style lang="scss" scoped>
.upload {
  width: 80%;
}
</style>
