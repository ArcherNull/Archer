<!--
 * @Author: Null
 * @Date: 2022-08-25 11:32:11
 * @Description: 用户
-->
<template>
  <div class="User">
    <el-dropdown ref="userDropdownRef" trigger="contextmenu">
      <span>
        <MyTooltip content="用户">
          <MyIconButton @clickIcon="showMenu">
            <UserIcon></UserIcon>
          </MyIconButton>
        </MyTooltip>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <span v-for="(cItem, cIndex) in contextmenuList" :key="cIndex" @click="operation(cItem)">
            <el-dropdown-item>
              <el-icon>
                <component :is="cItem.icon" />
              </el-icon>
              {{ cItem.title }}
            </el-dropdown-item>
          </span>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { User as UserIcon, House, SwitchButton } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { userUserInfoStore } from '@/store/system/user'

export default {
  name: 'User',
  components: {
    UserIcon,
    House,
    SwitchButton
  },
  setup () {
    const router = useRouter()
    const userUserInfo = userUserInfoStore()
    // 目标页面是非首页显示的右键菜单栏
    const contextmenuList = reactive([
      { icon: 'House', title: '个人中心', value: 'personalCenter' },
      { icon: 'SwitchButton', title: '退出登录', value: 'logOut' }
    ])
    const userDropdownRef = ref(null)
    // 展示下拉菜单
    const showMenu = () => {
      console.log('展示下拉菜单')
      userDropdownRef.value.handleOpen()
    }
    // 操作
    const operation = item => {
      console.log('操作=====>', item)
      switch (item.value) {
        case 'personalCenter':
          console.log('个人中心')
          break
        case 'logOut':
          logOut()
          break
      }
    }

    // 登出
    const logOut = () => {
      console.log('登出')
      userUserInfo.logOut().finally(() => {
        router.push({
          path: '/login'
        })
      })
    }

    return {
      contextmenuList,
      userDropdownRef,
      showMenu,
      operation
    }
  }
}
</script>

<style lang="scss" scoped>
.User {
  // height: inherit;
}
</style>
