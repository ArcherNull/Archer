import { request } from '@/utils'
import { saveAs } from 'file-saver'

/**
 * @description: 验证是否为blob格式
 * @param {any} data
 * @return {boolean} true / false
 */
export function blobValidate(data) {
  return data?.type !== 'application/json'
}

const errorCode = {
  401: '认证失败，无法访问系统资源',
  403: '当前操作没有权限',
  404: '访问资源不存在',
  default: '系统未知错误，请反馈给管理员',
}

const msgKey = 'downloadFile'

// 通用下载方法
export function download(
  url,
  data,
  filename,
  config,
) {
  $message.loading('正在下载数据，请稍候...', { key: msgKey })

  return request
    .request(url, {
      data,
      method: 'post',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob',
      responseReturn: 'raw',
      ...config,
    })
    .then(async (res) => {
      const data = res
      const isBlob = blobValidate(data)
      if (isBlob) {
        const blob = new Blob([data])
        saveAs(blob, filename)
      }
      else {
        const resText = await data.text()
        const rspObj = JSON.parse(resText)
        let errMsg = rspObj.msg || errorCode.default
        if (Object.keys(errorCode).includes(rspObj?.code)) {
          errMsg = errorCode[rspObj.code]
        }
        $message.error(errMsg)
      }
      $message.destroy(msgKey)
    })
    .catch((r) => {
      console.error(r)
      $message.error('下载文件出现错误，请联系管理员！')
      $message.destroy(msgKey)
    })
}
