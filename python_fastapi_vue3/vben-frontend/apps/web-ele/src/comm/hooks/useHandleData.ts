import type { HandleData } from './interface/index';

import { ElMessage, ElMessageBox } from 'element-plus';

/**
 * @description 操作单条数据信息 (二次确认【删除、禁用、启用、重置密码】)
 * @param {Function} api 操作数据接口的api方法 (必传)
 * @param {object} params 携带的操作数据参数 {id,params} (必传)
 * @param {string} message 提示信息 (必传)
 * @param {string} confirmType icon类型 (不必传,默认为 warning)
 * @returns {Promise} promise对象
 */
export const useHandleData = (
  api: (params: any) => Promise<any>,
  params: any = {},
  message: string,
  confirmType: HandleData.MessageType = 'warning',
) => {
  return new Promise((resolve, reject) => {
    ElMessageBox.confirm(`是否${message}?`, '温馨提示', {
      cancelButtonText: '取消',
      confirmButtonText: '确定',
      draggable: true,
      type: confirmType,
    })
      .then(async () => {
        const res = await api(params);
        if (!res) return reject(new Error('错误'));
        ElMessage({
          message: `${message}成功!`,
          type: 'success',
        });
        resolve(true);
      })
      .catch(() => {
        // cancel operation
      });
  });
};
