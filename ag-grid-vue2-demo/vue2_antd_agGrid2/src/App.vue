<!--
 * @Author: junsong Chen
 * @Date: 2024-03-29 22:00:28
 * @Email: 779217162@qq.com
 * @LastEditors: junsong Chen
 * @LastEditTime: 2024-07-22 21:31:04
 * @Description: 
-->
<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view />
    </div>
  </a-config-provider>
</template>

<script>
import zhCN from "ant-design-vue/lib/locale-provider/zh_CN";
export default {
  name: "App",
  provide() {
    return {
      reload: this.reload,
    };
  },
  data() {
    return {
      locale: zhCN,
      isRouterAlive: true,
    };
  },
  methods: {
    reload() {
      this.isRouterAlive = false;
      this.$nextTick(() => {
        this.isRouterAlive = true;
      });
    },
  },
};
</script>

<style>
#app {
  height: 100%;
}

.borderRed {
  border: solid 1px #f00;
}

.flex-censta {
  display: flex;
  align-content: center;
  justify-content: center;
}

.flex-cenend {
  display: flex;
  align-content: center;
  justify-content: flex-end;
}
</style>
