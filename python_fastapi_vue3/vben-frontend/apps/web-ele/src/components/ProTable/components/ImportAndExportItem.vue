<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-28 16:02:45
 * @LastEditTime: 2024-12-27 14:22:51
 * @Description: 
-->
<script setup name="ImportAndExportItem">
import { defineProps, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { getAPathByRPath } from '#/api/system/fileCenter';
import { downLoadByATag } from '#/comm/hooks/useDownload';
import { isNotEmptyObj } from '#/comm/utils';
import DKButton from '#/components/DKButton/index.vue';

const props = defineProps({
  fileType: {
    default: 1,
    type: Number,
  },
  itemInfo: {
    default() {
      return {};
    },
    type: Object,
  },
});

const btnLoading = ref(false);

// 下载文件
const downLoadFile = async (row) => {
  const downLoadUrl =
    props.fileType === 2 ? row.originImportFileUrl : row.errorFileUrl;
  if (downLoadUrl) {
    try {
      btnLoading.value = true;
      const res = await getAPathByRPath({
        path: downLoadUrl,
      });

      if (res?.code === 200) {
        const resData = res?.data || {};
        if (isNotEmptyObj(resData)) {
          const values = Object.values(resData);
          const dUrl = values[0];
          if (dUrl) {
            downLoadByATag(dUrl, row.fileName);
          } else {
            ElMessage.error('查询文件绝对路径为空，请联系管理员');
          }
        } else {
          ElMessage.error('查询文件绝对路径为空，请联系管理员');
        }
      } else {
        ElMessage.error(`下载文件失败${res?.msg}`);
      }

      btnLoading.value = false;
    } catch {
      btnLoading.value = false;
      ElMessage.error('下载文件失败');
    }
  } else {
    ElMessage.error('下载文件链接获取失败');
  }
};
</script>

<template>
  <div
    class="border-gary-300 mb-3 flex items-center justify-between gap-2 rounded-md border p-4"
  >
    <div>
      <div class="mb-2 font-bold">
        {{ itemInfo.fileName }}
        <el-tag
          :type="
            itemInfo.status === '成功'
              ? 'success'
              : itemInfo.status === '部分成功'
                ? 'warning'
                : itemInfo.status.indexOf('失败') !== -1
                  ? 'error'
                  : 'info'
          "
          class="ml-4"
        >
          {{ itemInfo.status }}
        </el-tag>
      </div>
      <div class="mb-1 flex gap-3 text-gray-400">
        <div>文件大小：{{ itemInfo.fileSize }}</div>
        <div>总条数：{{ itemInfo.totalRecord }}</div>
        <div>失败条数：{{ itemInfo.failRecord }}</div>
      </div>
      <div class="mb-1 text-gray-400">开始时间：{{ itemInfo.createdTime }}</div>
      <div class="text-gray-400">结束时间：{{ itemInfo.endTime }}</div>
    </div>

    <div
      v-if="
        fileType === 1 &&
        (itemInfo.status.indexOf('失败') !== -1 ||
          itemInfo.status.indexOf('部分成功') !== -1)
      "
    >
      <DKButton :loading="btnLoading" link @click="downLoadFile(itemInfo)">
        下载错误文件
      </DKButton>
    </div>
    <div v-else-if="fileType === 2">
      <DKButton :loading="btnLoading" link @click="downLoadFile(itemInfo)">
        下载
      </DKButton>
    </div>
  </div>
</template>
