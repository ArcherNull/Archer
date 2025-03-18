<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-04-02 20:56:34
 * @LastEditTime: 2024-07-26 01:15:01
 * @Description: 布局组件
-->
<template>
  <div class="layout">
    <div class="layout-box">
      <div class="layout-box-header">
        <div class="layout-box-header-left">
          <Logo></Logo>
        </div>
        <div class="layout-box-header-right">
          <a-popover title="扫一扫，关注公众号" trigger="click">
            <img
              slot="content"
              class="accountImg"
              src="@/assets/account.jpg"
              alt="account"
            />
            <a href="javascript:;" class="uheaderItem">百里千川公众号</a>
          </a-popover>

          <a href="http://dream.overflight.cn/zh" target="_blank">
            <span class="headerItem">百里千川官网</span>
          </a>

          <a-dropdown>
            <a class="ant-dropdown-link" @click.stop="">
              <span class="userName">{{
                userInfo.userName || "请先登录"
              }}</span>
              <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="https://juejin.cn/user/3633260177130872">
                  <a-icon type="html5" />
                  <span class="userName-logout">掘金博主</span>
                </a>
              </a-menu-item>
              <a-menu-item>
                <a href="https://gitee.com/bai-li-qian-chuan/blqc-ag-grid">
                  <a-icon type="github" />
                  <span class="userName-logout">gittee源码</span>
                </a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="handleDict">
                  <a-icon type="diff" />
                  <span class="userName-logout">字典管理</span>
                </a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="handleResetPwd">
                  <a-icon type="lock" />
                  <span class="userName-logout">重置密码</span>
                </a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="handleLogout">
                  <a-icon type="logout" />
                  <span class="userName-logout">退出登录</span>
                </a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
      </div>
      <!-- 导航 -->
      <div class="layout-box-nav">
        <router-link
          :to="{ path: item.path }"
          :class="[
            item.path === $route.fullPath ? 'activePath' : 'unActivePath',
          ]"
          v-for="(item, index) in pathList"
          :key="index"
        >
          {{ item.name }}
        </router-link>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="layout-main">
      <router-view />
    </div>

    <!-- 字典管理 -->
    <!-- <DictDialog :visible.sync="openDictDialog"></DictDialog> -->

    <!-- 重置密码 -->
    <ResetPwdDialog :visible.sync="openResetPwdDialog"></ResetPwdDialog>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import Logo from "./components/Logo.vue";
import ResetPwdDialog from "./components/ResetPwdDialog.vue";
// import DictDialog from "./components/DictDialog.vue";

export default {
  name: "layoutComponents",
  components: {
    Logo,
    ResetPwdDialog,
    // DictDialog,
  },
  data() {
    return {
      openResetPwdDialog: false,
      openDictDialog: false,

      activePath: "/index",
      pathList: [
        {
          name: "首页",
          path: "/index",
        },
        {
          name: "字典管理",
          path: "/base/dict-manage",
        },
        {
          name: "ag-grid基础使用",
          path: "/base/user-manage",
        },
        {
          name: "ag-grid示例订单",
          path: "/order/order-manage",
        },
        {
          name: "百度地图",
          path: "/map/baidu-map",
        },
      ],
    };
  },
  computed: {
    ...mapState("user", ["userInfo"]),
  },
  methods: {
    ...mapActions("user", ["logout"]),

    // 登出
    handleLogout() {
      console.log("登出");
      this.logout().then((res) => {
        res &&
          this.$router.push({
            path: "/login",
          });
      });
    },
    // 设置字典管理
    handleDict() {
      console.log("设置字典管理");
      this.openDictDialog = true;
    },
    // 重置密码
    handleResetPwd() {
      console.log("重置密码");
      this.openResetPwdDialog = true;
    },
  },
};
</script>

<style lang="less" scoped>
@layout-header-height: 60px;

.layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  &-box {
    position: sticky;
    top: 0;
    z-index: 100;
    &-header {
      height: @layout-header-height;
      box-sizing: border-box;
      padding: 0 20px;
      background-color: antiquewhite;

      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;

      &-right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 20px;
        gap: 20px;
      }
    }

    &-nav {
      background-color: #fff;
      padding: 10px 40px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 20px;
      font-size: 16px;
      cursor: pointer;
    }
  }

  &-main {
    flex: 1;
    background-color: rgb(245, 245, 245);
    padding: 16px;
    box-sizing: border-box;
  }
}

.headerItem {
  color: #da8141;
}

.accountImg {
  width: 150px;
  height: 150px;
}

.userName {
  margin-right: 6px;

  &-logout {
    margin-left: 4px;
  }
}

.activePath {
  padding: 4px 16px;
  color: #fff;
  background: #662b0f;
  border-radius: 6px;
  font-size: 14px;
}
.unActivePath {
  padding: 6px 16px;
  font-size: 14px;
}
</style>
