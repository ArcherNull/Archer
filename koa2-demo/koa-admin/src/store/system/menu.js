/*
 * @Author: Null
 * @Date: 2022-09-05 11:06:57
 * @Description: 菜单栏
 */
import { isEmpty, isObject, isArray } from 'lodash-es'
import { defineStore } from 'pinia'

// 唯一标签页
const uniqueTag = (tag, that) => {
  if (tag.path !== '/index') {
    const addTag = isObject(tag) ? [tag] : isArray(tag) ? tag[0] : []
    const findItem = that.tagViewsList.find(ele => ele.path === tag?.path)
    return !findItem ? addTag : []
  } else {
    return []
  }
}

// 菜单栏
export const useMenuStore = defineStore('menuStore', {
  state: () => ({
    indexPage: {
      title: '首页',
      name: '/index',
      path: '/index',
      cache: false
    },
    // 是否折叠菜单栏
    isCollapseMenu: false,
    // 当前路由，默认为首页
    currentRoute: '/index',
    // 浏览过的路由列表,存入标签页
    tagViewsList: []
  }),
  actions: {
    // 改变菜单栏折叠状态
    onIsCollapseMenu (bool) {
      this.isCollapseMenu = bool
    },
    // 设置当前标签页
    setCurrentRoute (currentRoute) {
      this.currentRoute = currentRoute
    },
    // 增加单个标签页
    addTags (tags) {
      console.log('tag=====>', tags)
      if (!isEmpty(tags)) {
        const addTags = uniqueTag(tags, this)
        // 判断标签页是否存在首页标签
        if (this.tagViewsList?.length) {
          this.tagViewsList = [...this.tagViewsList, ...addTags]
        } else {
          this.tagViewsList = [this.indexPage, ...addTags]
        }
      }
    },
    // 移除标签页
    removeTags (tags) {
      console.log('tag=====>', tags)
      if (!isEmpty(tags)) {
        const addTags = uniqueTag(tags, this)
        // 判断标签页是否存在首页标签
        if (this.tagViewsList?.length) {
          this.tagViewsList = [...this.tagViewsList, ...addTags]
        } else {
          this.tagViewsList = [this.indexPage, ...addTags]
        }
      }
    }
  }
})
