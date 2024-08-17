<!--
 * @Author: Null
 * @Date: 2022-08-24 17:16:42
 * @Description:
-->
<template>
  <div class="TagViews">
    <el-tabs
      :model-value="store.currentRoute"
      type="card"
      class="TagViews-tabs"
      closable
      @tab-change="tabsHandleChange"
      @tab-remove="handleTabRemove($event, 'close')"
    >
      <el-tab-pane
        v-for="item in store.tagViewsList"
        :key="item.name"
        :label="item.title"
        :name="item.name"
        closable
      >
        <!-- 右键菜单开始：自定义标签页显示名称，保证每个标签页都能实现右键菜单 -->
        <template #label>
          <el-dropdown
            :id="item.name"
            ref="dropdownRef"
            trigger="contextmenu"
            @visible-change="handleChange($event, item.name)"
          >
            <span :class="store.currentRoute === item.name ? 'TagViews-label' : ''">{{ item.title }}</span>
            <template #dropdown>
              <el-dropdown-menu>
                <span v-for="(cItem, cIndex) in contextmenuList" :key="cIndex">
                  <el-dropdown-item
                    v-if="isShowMenu(item.name, cItem.value)"
                    @click="handleTabRemove(item.name, cItem.value)"
                  >
                    <el-icon>
                      <component :is="cItem.icon" />
                    </el-icon>
                    {{ cItem.title }}
                  </el-dropdown-item>
                </span>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <!-- 右键菜单结束 -->
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ref, reactive, inject, onMounted } from 'vue'
import { useMenuStore } from '@/store/system/menu'
import { useRouter } from 'vue-router'
import { DArrowLeft, DArrowRight, Operation, Minus, Close, Refresh } from '@element-plus/icons-vue'
import { showMessage } from '@/common/index'

export default {
  name: 'TagViews',
  components: {
    DArrowLeft,
    DArrowRight,
    Operation,
    Minus,
    Close,
    Refresh
  },
  setup () {
    // 路由
    const router = useRouter()
    const store = useMenuStore()
    const reload = inject('reload')
    // 目标页面是首页显示的右键菜单栏
    // const contextmenuListIndex = reactive([
    //   { icon: 'closeAll', title: '关闭全部', value: 'all' }
    // ])
    // 目标页面是非首页显示的右键菜单栏
    const contextmenuList = reactive([
      { icon: 'Refresh', title: '刷新', value: 'refresh' },
      { icon: 'Close', title: '关闭当前标签页', value: 'close' },
      { icon: 'DArrowLeft', title: '关闭左侧标签页', value: 'left' },
      { icon: 'DArrowRight', title: '关闭右侧标签页', value: 'right' },
      { icon: 'Operation', title: '关闭其他标签页', value: 'other' },
      { icon: 'Minus', title: '关闭全部标签页', value: 'all' }
    ])

    onMounted(() => {
      console.log('mounted-----渲染次数')
    })

    // 切换标签卡
    const tabsHandleChange = ele => {
      router.push({
        path: ele || '/index'
      })
    }

    // 移除标签卡
    const handleTabRemove = (targetName, command) => {
      const tagViewsListVal = store.tagViewsList
      const index = tagViewsListVal.findIndex(item => item.name === targetName)

      const refresh = () => {
        reload && reload()
      }

      const closeCurrent = targetName => {
        if (targetName !== '/index') {
          tagViewsListVal.splice(index, 1)
          if (targetName === store.currentRoute) {
            store.currentRoute = index === 0 ? 'index' : tagViewsListVal[index - 1].path
          }
        } else {
          showMessage('首页标签不能被清除')
        }
      }

      const closeLeft = () => {
        tagViewsListVal.splice(1, index)
      }

      const closeRight = () => {
        tagViewsListVal.splice(index + 1, tagViewsListVal.length)
      }

      const closeOther = () => {
        store.tagViewsList = [tagViewsListVal[index]]
      }

      switch (command) {
        case 'refresh':
          console.log('刷新')
          refresh()
          break
        case 'close':
          console.log('关闭当前标签页')
          closeCurrent(targetName)
          break
        case 'left':
          console.log('关闭左侧标签页')
          closeLeft()
          break
        case 'right':
          console.log('关闭右侧标签页')
          closeRight()
          break
        case 'other':
          console.log('关闭其他标签页')
          closeOther()
          break
        case 'all':
          console.log('关闭全部标签页')
          break
      }
    }

    const isShowMenu = (name, type) => {
      if (['left', 'right'].includes(type)) {
        const index = store.tagViewsList.findIndex(item => name === item.name)
        return type === 'left' ? index !== 0 : index !== store.tagViewsList.length - 1
      } else if (type === 'other') {
        return store.tagViewsList.length > 1
      } else if (type === 'all') {
        return store.tagViewsList.length !== 0
      } else {
        return true
      }
    }

    const dropdownRef = ref(null)
    const handleChange = (visible, name) => {
      if (!visible) return
      dropdownRef.value.forEach(item => {
        if (item.id === name) return
        item.handleClose()
      })
    }

    return {
      store,
      tabsHandleChange,
      handleTabRemove,

      isShowMenu,
      handleChange,
      dropdownRef,
      contextmenuList,
      reload
    }
  }
}
</script>

<style lang="scss" scoped>
.TagViews {
  &-tabs {
    :deep(.el-tabs__header) {
      margin: 0 0 !important;
      box-sizing: border-box !important;
      border: none !important;
    }

    :deep(.el-tabs__nav-wrap) {
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 12%), 0 0 3px 0 rgb(0 0 0 / 4%);
    }

    .el-tabs__content {
      padding: 32px;
      color: #6b778c;
      font-size: 32px;
      font-weight: 600;
      cursor: pointer;
    }
  }
}

.TagViews-label {
  color: var(--el-color-primary); //激活标签页高亮
}

:deep(.el-tabs__item) {
  &:hover {
    span {
      color: var(--el-color-primary); //鼠标移到标签页高亮
    }
  }

  .el-dropdown {
    line-height: inherit; // 统一标签页显示名称行高
  }
}
</style>
