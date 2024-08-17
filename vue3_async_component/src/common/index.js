/*
 * @Author: Null
 * @Date: 2022-08-24 11:04:53
 * @Description:  公共方法
 */
import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'
import { isEmpty, isObject } from 'lodash-es'

const common = {
  formSize: 'default'
}

// 错误提示
export const showMessage = (obj, type, duration) => {
  let msgObj = {
    message: '错误',
    type: type || 'warning',
    duration: duration || 2000
  }
  if (isObject(obj) && !isEmpty(obj)) {
    msgObj = Object.assign(msgObj, obj)
  } else {
    msgObj.message = obj
  }
  ElMessage(msgObj)
}

// 提示
export const showNotification = (obj, type, title, duration) => {
  let msgObj = {
    title: title || '提示',
    message: '错误',
    type: type || 'warning',
    duration: duration || 2000
  }
  if (isObject(obj) && !isEmpty(obj)) {
    msgObj = Object.assign(msgObj, obj)
  } else {
    msgObj.message = obj
  }
  ElNotification(msgObj)
}

// 确认弹窗
export function showConfirm (obj, callback) {
  const msgObj = {
    title: '提示',
    description: '您确定执行接下来的操作吗？',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }

  const { title, description, ...restObj } = Object.assign(msgObj, obj)

  ElMessageBox.confirm(description, title, {
    ...restObj
  }).then(res => {
    callback(res)
  })
}

// 提交内容弹窗
export function showPrompt (obj, callback) {
  const msgObj = {
    title: '提示',
    description: '您确定执行接下来的操作吗？',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^[ ]+$/,
    inputErrorMessage: '输入不能为空',
    type: 'warning'
  }

  const { title, description, ...restObj } = Object.assign(msgObj, obj)

  ElMessageBox.prompt(description, title, {
    ...restObj
  }).then(res => {
    callback(res)
  })
}
export default common
