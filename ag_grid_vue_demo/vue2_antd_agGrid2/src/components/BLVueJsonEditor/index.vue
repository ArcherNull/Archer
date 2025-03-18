<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-06-27 10:27:27
 * @LastEditTime: 2024-06-27 11:02:12
 * @Description: 
-->
<template>
  <div class="BLVueJsonEditor">
    <vue-json-editor
      v-model="jsonContent"
      :show-btns="false"
      mode="code"
      lang="zh"
      :expanded-on-start="true"
      @json-change="onJsonChange"
      @json-save="onJsonSave"
      @has-error="onError"
    />
  </div>
</template>

<script>
import VueJsonEditor from "vue-json-editor";
export default {
  name: "BLVueJsonEditor",
  components: {
    VueJsonEditor,
  },
  data() {
    return {
      hasJsonFlag: true, // json是否验证通过
      jsonContent: {}, //这个变量可以为空，编辑器会显示为{}
    };
  },
  methods: {
    onJsonChange(value) {
      // 实时保存
      this.onJsonSave(value);
    },
    onJsonSave(value) {
      this.jsonContent = value;
      this.hasJsonFlag = true;
    },
    onError(value) {
      console.log("json错误了value:", value);
      this.hasJsonFlag = false;
    },
    // 检查json
    checkJson() {
      if (this.hasJsonFlag === false) {
        this.$message.error("请输入格式正确的JSON数据!");
        return false;
      } else {
        return true;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.BLVueJsonEditor {
  ::v-deep {
    /* jsoneditor右上角默认有一个链接,加css去掉 */
    .jsoneditor-poweredBy {
      display: none !important;
    }

    /*修改高度*/
    div.jsoneditor-outer {
      height: 300px;
    }
    /*修改菜单栏背景颜色,原始背景为蓝色，为了和整体页面风格一致，改为黑色*/
    div.jsoneditor-menu {
      background-color: #000;
      border-bottom: 1px solid #000;
    }

    /*修改输入框边框颜色*/
    div.jsoneditor {
      border: 1px solid #000;
    }
  }
}
</style>
