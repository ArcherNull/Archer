/*
 * @Author: junsong Chen
 * @Date: 2024-03-29 22:00:28
 * @Email: 779217162@qq.com
 * @LastEditors: junsong Chen
 * @LastEditTime: 2024-04-04 18:46:40
 * @Description: 
 */
import Vue from 'vue'
import Loading from './MyLoading.vue'
/**
 * Vue.extend 接受参数并返回一个构造器，new 该构造器可以返回一个组件实例
 * 当我们 new Mask() 的时候，把该组件实例挂载到一个 div 上
 **/
const Mask = Vue.extend(Loading)
//   myLoadingType: 'default'

// 更新是否显示
const toggleLoading = (el, binding) => {
  if (binding.value) {
    Vue.nextTick(() => {
      // 控制loading组件显示
      el.instance.visible = true
      el.style.position = 'relative'
      // 插入到目标元素
      insertDom(el, el)
    })
  } else {
    el.instance.visible = false
    el.style.position = 'static'
    el.mask && el.mask.parentNode && el.mask.parentNode.removeChild(el.mask)
  }
}

// 插入到目标元素
const insertDom = (parent, el) => {
  parent.appendChild(el.mask)
}

export default {
  // 第一次绑定到元素时调用
  bind: function (el, binding) {
    const { modifiers } = binding
    let myLoadingType = 'default'
    if (modifiers) {
      const arr = Object.keys(modifiers)
      if (arr.length) {
        console.log('获取自定义指令myLoading修饰符 ======>', modifiers)
        myLoadingType = ['bounce'].includes(arr[0]) ? arr[0] : 'default'
      }
    }
    const mask = new Mask({
      el: document.createElement('div'),
      data () {
        return {
          myLoadingType: myLoadingType
        }
      }

    })
    // console.log('mask====>', mask)
    // 用一个变量接住mask实例
    el.instance = mask
    el.mask = mask.$el
    el.maskStyle = {}
    binding.value && toggleLoading(el, binding)
  },
  // 所在组件的 VNode 更新时调用--比较更新前后的值
  update: function (el, binding) {
    if (binding.oldValue !== binding.value) {
      toggleLoading(el, binding)
    }
  },
  // 指令与元素解绑时调用
  unbind: function (el) {
    el.instance && el.instance.$destroy()
  }
}
