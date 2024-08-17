/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-11 11:45:57
 * @LastEditTime: 2023-07-11 11:53:26
 * @Description:
 */
import drag from './drag'

const install = function (Vue) {
  Vue.directive('el-drag-dialog', drag)
}

if (window.Vue) {
  window['el-drag-dialog'] = drag
  Vue.use(install); // eslint-disable-line
}

drag.install = install
export default drag
