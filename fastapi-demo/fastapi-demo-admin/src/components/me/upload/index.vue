<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-04-16 19:53:08
 * @LastEditTime: 2025-04-16 19:57:36
 * @Description:
-->
<template>
  <div>
    <n-spin :show="uploadLoading" size="small">
      <n-upload
        :action="UPLOAD_FILE_URL"
        :default-file-list="props.defaultFileList"
        :default-upload="defaulUpload"
        list-type="image-card"
        :headers="headers"
        :max="max"
        :multiple="multiple || max > 1"
        accept="image/*"
        :on-before-upload="onBeforeUpload"
        :on-update:file-list="fileListUpdate"
        :on-change="fileChange"
        :on-finish="fileFinishChange"
      />
    </n-spin>
  </div>
</template>

<script setup>
import apis, { UPLOAD_FILE_URL } from '@/api/index'
import { getAbsoluteUrl } from '@/utils/common'
import { getHeaders } from '@/utils/http/interceptors'
import { toRaw } from 'vue'

const props = defineProps({
  // 选择文件时候是否默认上传
  defaulUpload: {
    type: Boolean,
    default: true,
  },
  // 是否支持多个文件
  multiple: {
    type: Boolean,
    default: false,
  },
  // 限制上传文件数量, undefined 表示不限制
  max: {
    type: [Number, undefined],
    default: undefined,
  },
  // 预览文件列表
  defaultFileList: {
    type: Object,
    default: () => {},
  },
})
const emit = defineEmits(['finish', 'update'])

const uploadLoading = ref(false)
const cFileList = ref(props.defaultFileList)
const headers = getHeaders()

// 获取当前上传文件列表
function getFileList() {
  return toRaw(cFileList.value)
}

// 上传前校验
function onBeforeUpload(file, fileList) {
  console.log('上传前校验', file)
  console.log('上传前校验123', fileList)
}

// 当 file-list 改变时触发的回调函数
function fileListUpdate(fileList) {
  console.log('改变时触发的回调函数fileListUpdate', fileList)
  cFileList.value = fileList
  emit('update', fileList)
}

// 文件更改
function fileChange(file, fileList) {
  console.log('文件更改fileChange', file)
  console.log('文件更改fileChange', fileList)
}

// 文件上传结束的回调
function fileFinishChange(file) {
  console.log('文件上传结束的回调fileFinishChange', file)
  const res = file?.event?.currentTarget?.response
  if (res) {
    const resObj = JSON.parse(res)
    const urls = resObj?.data?.urls
    if (urls) {
      console.log('urls=====>', urls)
      emit('finish', {
        urls,
        ajaxRes: resObj,
        file,
      })
    }
  }
}

// 上传接口
function uploadAjax() {
  return new Promise((resolve, reject) => {
    const fileList = getFileList()
    const rejectFun = (text) => {
      reject(new Error(text))
    }
    if (fileList?.length) {
      const mForm = new FormData()
      const uFileArr = []
      const hasFileArr = []
      fileList.forEach((ele) => {
        if (ele?.file instanceof File) {
          uFileArr.push(ele)
          mForm.append('file', ele.file)
        }
        else {
          hasFileArr.push(ele)
        }
      })

      if (uFileArr.length) {
        uploadLoading.value = true
        apis.file
          .uploadFile(mForm)
          .then((res) => {
            if (res?.code === 200) {
              const urls = res?.data?.urls
              console.log('上传图片urls', urls)
              urls.forEach((url, index) => {
                uFileArr[index].url = getAbsoluteUrl(url)
                uFileArr[index].rUrl = url
              })
              const newFileList = [...uFileArr, ...hasFileArr]
              resolve(newFileList)
            }
            else {
              rejectFun(res?.message || '上传图片失败')
            }
          })
          .finally(() => {
            uploadLoading.value = false
          })
      }
      else {
        const newFileList = hasFileArr
        resolve(newFileList)
      }
    }
    else {
      rejectFun('未获取到需要上传图片文件')
    }
  })
}

defineExpose({
  getFileList,
  uploadAjax,
})
</script>
