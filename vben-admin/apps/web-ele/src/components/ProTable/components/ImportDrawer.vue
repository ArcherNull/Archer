<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-15 15:52:26
 * @LastEditTime: 2025-03-13 17:12:01
 * @Description: 
-->
<script setup name="ImportDrawer">
import { defineExpose, defineProps, ref } from 'vue';

import { Refresh } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';

import { getImportCenterList, importFile } from '#/api/system/fileCenter';
import { downLoadFile } from '#/comm/utils/index';
import DKButton from '#/components/DKButton/index.vue';
import DKContanier from '#/components/DKContanier/index.vue';
import { IMPORT_fILE_ENUM } from '#/components/ProTable/comm/constants';

import ImportAndExportItem from './ImportAndExportItem.vue';

defineProps({});

const drawerVisible = ref(false);
const parameter = ref({
  fileSize: 10,
  fileType: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  title: '',
});

// 最大文件上传数
const excelLimit = ref(1);
const historyStatus = ref('loading');
const historyErrMsg = ref('');
const fileTypeStr = ref('');
const historyList = ref([]);
const templateStr = ref();
const fileList = ref([]);

/**
 * @description 文件上传之前判断
 */
const beforeExcelUpload = (file) => {
  const isExcel = parameter.value.fileType.includes(file.type);
  const fileSize = file.size / 1024 / 1024 < parameter.value.fileSize;
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

// 获取导入文件历史列表
const getFileHistoryList = async (fileType) => {
  try {
    const menuName = IMPORT_fILE_ENUM[fileType];

    if (menuName) {
      historyStatus.value = 'loading';
      const res = await getImportCenterList({
        menuName,
        pageNum: 1,
        pageSize: 100,
        type: 1,
      });
      console.log('获取导入文件历史列表', res);
      const resData = res?.result || [];
      historyList.value = resData;
      historyStatus.value = resData?.length ? 'success' : 'empty';
    } else {
      historyErrMsg.value = '未获取到导入模板';
    }
  } catch (error) {
    historyStatus.value = 'error';
    historyErrMsg.value = error?.message || '查询导入历史记录失败';
  }
};

// 文件上传
const uploadExcel = async (param) => {
  const excelFormData = new FormData();
  excelFormData.append('file', param.file);
  await importFile(excelFormData, fileTypeStr.value);
  drawerVisible.value = true;
};

// 上传成功提示
const excelUploadSuccess = () => {
  ElNotification({
    message: `批量添加${parameter.value.title}成功！`,
    title: '温馨提示',
    type: 'success',
  });
  getFileHistoryList(fileTypeStr.value);
};

// 下载模板
const downloadTemplete = () => {
  console.log('下载模板');
  const url = `https://dekun-bi.oss-cn-shenzhen.aliyuncs.com/importAndExportDetails/uploadExcelFile/${templateStr.value}`;
  downLoadFile(url);
};

const handleOpen = (options) => {
  fileList.value = [];
  const { fileType, template } = options;
  templateStr.value = template;
  fileTypeStr.value = fileType;
  drawerVisible.value = true;
  getFileHistoryList(fileType);
};

defineExpose({
  handleOpen,
});
</script>

<template>
  <el-drawer v-model="drawerVisible" size="600px" title="导入">
    <div class="table-main">
      <DKContanier class-type="grid1" title="上传导入文件">
        <template #subTitle>
          <DKButton v-if="templateStr" size="small" @click="downloadTemplete()">
            下载模板
          </DKButton>
        </template>
        <div class="mt-2">
          <el-alert
            title="请先下载对应模板，填写完数据，然后上传该导入文件"
            type="warning"
          />
          <div class="mt-4">
            <el-upload
              v-model:file-list="fileList"
              :accept="parameter.fileType.join(',')"
              :before-upload="beforeExcelUpload"
              :drag="true"
              :http-request="uploadExcel"
              :limit="excelLimit"
              :multiple="false"
              :on-error="excelUploadError"
              :on-exceed="handleExceed"
              :on-success="excelUploadSuccess"
              :show-file-list="true"
              action="#"
              class="upload"
            >
              <slot name="empty">
                <el-icon class="el-icon--upload">
                  <upload-filled />
                </el-icon>
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
            </el-upload>
          </div>
        </div>
      </DKContanier>
      <DKContanier
        :content-status="historyStatus"
        :err-msg="historyErrMsg"
        class-type="grid1"
        title="导入历史记录"
      >
        <template #subTitle>
          <DKButton
            v-if="fileTypeStr"
            :icon="Refresh"
            circle
            class="iconBtnCss"
            plain
            title="刷新"
            @click="getFileHistoryList(fileTypeStr)"
          />
        </template>
        <div class="mt-2">
          <ImportAndExportItem
            v-for="(item, index) in historyList"
            :key="index"
            :item-info="item"
          />
        </div>
      </DKContanier>
    </div>
  </el-drawer>
</template>
