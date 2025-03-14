<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-03-13 16:47:18
 * @LastEditTime: 2025-03-13 17:12:27
 * @Description: 
-->
<script setup name="ExportDrawer">
import { defineExpose, defineProps, ref } from 'vue';

import { Refresh } from '@element-plus/icons-vue';

import { exportFile, getImportCenterList } from '#/api/system/fileCenter';
import DKButton from '#/components/DKButton/index.vue';
import DKContanier from '#/components/DKContanier/index.vue';
import { IMPORT_fILE_ENUM } from '#/components/ProTable/comm/constants';

import ImportAndExportItem from './ImportAndExportItem.vue';

defineProps({});

const drawerVisible = ref(false);
const exportLoading = ref(false);
const historyStatus = ref('loading');
const historyErrMsg = ref('');
const fileTypeStr = ref('');
const historyList = ref([]);
const exportParamsFun = ref(null);

// 获取导出文件历史列表
const getFileHistoryList = async (fileType) => {
  try {
    const menuName = IMPORT_fILE_ENUM[fileType];

    if (menuName) {
      historyStatus.value = 'loading';
      const res = await getImportCenterList({
        menuName,
        type: 2,
      });
      console.log('获取导出文件历史列表', res);
      const resData = res?.result || [];
      historyList.value = resData;
      historyStatus.value = resData?.length ? 'success' : 'empty';
    } else {
      historyStatus.value = 'error';
      historyErrMsg.value = '未获取到导出模板';
    }
  } catch (error) {
    historyStatus.value = 'error';
    historyErrMsg.value = error?.message || '查询导出历史记录失败';
  }
};

const exportFileFun = async () => {
  try {
    exportLoading.value = true;
    let param = {};
    if (typeof exportParamsFun.value === 'function') {
      param = exportParamsFun.value();
    }
    console.log('param=====>', JSON.stringify(param));
    const res = await exportFile({
      fileType: fileTypeStr.value,
      params: JSON.stringify(param),
    });
    console.log('res=====>', res);
  } finally {
    exportLoading.value = false;
    getFileHistoryList(fileTypeStr.value);
  }
};

const handleOpen = (options) => {
  console.log('options=====>', options);
  const { exportParam, fileType } = options;
  exportParamsFun.value = exportParam;
  drawerVisible.value = true;
  fileTypeStr.value = fileType;
  fileType && getFileHistoryList(fileType);
};

defineExpose({
  handleOpen,
});
</script>

<template>
  <el-drawer v-model="drawerVisible" size="600px" title="导出">
    <div class="table-main">
      <DKContanier class-type="grid1" title="导出">
        <template #subTitle>
          <DKButton
            :loading="exportLoading"
            size="small"
            @click="exportFileFun()"
          >
            导出
          </DKButton>
        </template>
        <div class="mt-2">
          <el-alert title="请先确定需要导出的条件，再点击导出" type="warning" />
          <!-- <div class="mt-4">123123123</div> -->
        </div>
      </DKContanier>
      <DKContanier
        :content-status="historyStatus"
        :err-msg="historyErrMsg"
        class-type="grid1"
        title="导出历史记录"
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
            :file-type="2"
            :item-info="item"
          />
        </div>
      </DKContanier>
    </div>
  </el-drawer>
</template>
