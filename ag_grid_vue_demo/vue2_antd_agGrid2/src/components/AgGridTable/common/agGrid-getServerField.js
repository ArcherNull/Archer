/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-01-26 11:24:13
 * @LastEditTime: 2024-01-26 15:20:38
 * @Description: 获取数据库用户自定义字段
 */

/**
 * @description: 本地字段兼容服务器字段的特征，并保持新增删除修改，返回新合成字段数组
 * @param {*} localData 本地字段【最新】
 * @param {*} oldServerData 服务器字段【旧版，具有特征的】
 *
 * 以本地字段为基准，去寻找服务器特定属性，
 * 【难点】构建新排序标识
 *
 * @return {*}
 */
export function initFieldFun (localData, oldServerData) {
  const oldServerDataIsNotEmpty = oldServerData && Array.isArray(oldServerData) && oldServerData.length !== 0

  if (oldServerDataIsNotEmpty) {
    for (const field of localData) {
      let findOldIndex = 0
      const findItem = oldServerData.find((oldField, oldIndex) => {
        if (`${field.headerName}` === `${oldField.headerName}`) {
          findOldIndex = oldIndex
          return true
        }
      })
      if (findItem) {
        // 原字段排序标识
        field.colId = findOldIndex
        field.hide = findItem.hide || false
        field.pinned = findItem.pinned || false
      } else {
        field.isNew = true
        field.hide = false
      }
    }

    localData.sort(function (a, b) {
      const convertNum = (num) => {
        const val = Number(num)
        return isNaN(val) ? 0 : val
      }
      return convertNum(a.colId) - convertNum(b.colId)
    })
  }
  return localData
}
