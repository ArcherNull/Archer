/*
 * @Author: Null
 * @Date: 2022-08-25 09:55:18
 * @Description: 用于组件使用的方法
 */

import { defineAsyncComponent } from 'vue'
// 加载中组件
import LoadingComponent from './components/LoadingComponent/index.vue'
// 错误组件
import ErrorComponent from './components/ErrorComponent/index.vue'

// 加载中组件
import pageLoadingComponent from './pages/LoadingComponent/index.vue'
// 错误组件
import pageErrorComponent from './pages/ErrorComponent/index.vue'

/**
 * @param value
 * @returns {string}  强数据类型校验
 * 示例 isType(func) !== 'Function'
 */
export function isType (value) {
  return Object.prototype.toString.call(value).slice(8, -1)
}

// 自定义异步组件，统一束口
export const customerAsyncComponent = (component) => {
  if (component) {
    const isTypeStr = isType(component)
    if (isTypeStr === 'Function') {
      // return defineAsyncComponent(component);
      return defineAsyncComponent({
        loader: component,
        loadingComponent: LoadingComponent,
        errorComponent: ErrorComponent,
        delay: 200,
        timeout: 3000
      })
    } else if (isTypeStr === 'Object') {
      const { loader, loadingComponent, errorComponent, delay, timeout } =
        component

      if (loader && isType(loader) === 'Function') {
        return defineAsyncComponent({
          loader,
          loadingComponent: loadingComponent || LoadingComponent,
          errorComponent: errorComponent || ErrorComponent,
          delay: delay || 200,
          timeout: timeout || 3000
        })
      } else {
        console.error('异步工程组件的loader是必传项，请检查！！！')
      }
    }
  } else {
    console.error('异步组件引入方法必传，请检查！！！')
  }
}

// 自定义异步组件，统一束口
export const pageAsyncComponent = (component) => {
  if (component) {
    const isTypeStr = isType(component)
    if (isTypeStr === 'Function') {
      // return defineAsyncComponent(component);
      return defineAsyncComponent({
        loader: component,
        loadingComponent: pageLoadingComponent,
        errorComponent: pageErrorComponent,
        delay: 200,
        timeout: 3000
      })
    } else if (isTypeStr === 'Object') {
      const { loader, loadingComponent, errorComponent, delay, timeout } =
        component

      if (loader && isType(loader) === 'Function') {
        return defineAsyncComponent({
          loader,
          loadingComponent: loadingComponent || LoadingComponent,
          errorComponent: errorComponent || ErrorComponent,
          delay: delay || 200,
          timeout: timeout || 3000
        })
      } else {
        console.error('异步工程组件的loader是必传项，请检查！！！')
      }
    }
  } else {
    console.error('异步组件引入方法必传，请检查！！！')
  }
}
