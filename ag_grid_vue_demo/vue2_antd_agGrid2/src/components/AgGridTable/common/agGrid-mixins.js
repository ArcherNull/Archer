/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-01-26 15:36:34
 * @LastEditTime: 2024-02-24 16:50:49
 * @Description: ag-grid公共混入
 */
import { cloneDeep } from 'lodash'

import { gridOptions } from './agGrid-options'
import { defaultColDef } from './agGrid-defaultColDef'
import { agGridMethods } from './agGrid-methods'

export default {
  data() {
    return {
      gridOptions: cloneDeep(gridOptions),
      cloneGridOptions: cloneDeep(gridOptions),

      defaultColDef: cloneDeep(defaultColDef),
      cloneDefaultColDef: cloneDeep(defaultColDef)
    }
  },
  methods: {
    ...agGridMethods
  }
}
