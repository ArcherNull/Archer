/*
 * @Author: Null
 * @Date: 2022-08-23 16:07:35
 * @Description: 测试
 */
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment () {
      this.count++
    }
  }
})

// 定义 el-button 的自定义属性
export const useElButtonStore = defineStore('elButton', {
  state: () => ({
    // 采用了MyButton组件统一样式设置 , large / default /small
    size: 'default',
    // 是否朴素按钮
    plain: false,
    // 是否为文字按钮
    text: false,
    // 是否显示文字按钮背景颜色
    bg: false,
    // 是否为圆角按钮
    round: false,
    // 是否为圆形按钮
    circle: false,
    // 是否禁用状态
    disabled: false,
    // 图标类名
    icon: '',
    // 类型  primary / success / warning / danger / info / text
    type: '',
    // 全局禁用提示语
    title: ''
  }),
  actions: {
    increment () {
      this.count++
    }
  }
})
