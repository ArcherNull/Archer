<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-04-22 15:42:55
 * @LastEditTime: 2024-07-22 11:48:18
 * @Description: 首页
-->
<template>
  <div class="IndexPage">
    <div>
      <h3>树型数据展示</h3>
      <h4>
        企业版本的，需要收费treeData :
        https://www.ag-grid.com/javascript-grid/modules/
      </h4>
    </div>
    <div>
      <AgGridVue
        class="ag-theme-balham"
        style="height: 400px; width: 100%; border: solid 1px #f00"
        :gridOptions="gridOptions"
      >
      </AgGridVue>
    </div>
  </div>
</template>

<script>
import { AgGridVue } from "ag-grid-vue";
// 引入ag-grid-vue 主题样式
import "ag-grid-community/styles/ag-grid.css"; // 基础表格样式
import "ag-grid-community/styles/ag-theme-balham.css"; // balham

export default {
  name: "IndexPage",
  components: {
    AgGridVue,
  },
  data() {
    return {
      gridOptions: {
        treeData: true,
        columnDefs: [
          {
            field: "jobTitle",
            headerName: "jobTitle",
            cellRenderer: "agGroupCellRenderer",
          },
          {
            field: "employmentType",
            headerName: "employmentType",
            cellRenderer: "agGroupCellRenderer",
          },
        ],
        rowData: [
          {
            orgHierarchy: ["Erica"],
            jobTitle: "CEO",
            employmentType: "Permanent",
          },
          {
            orgHierarchy: ["Erica", "Malcolm"],
            jobTitle: "VP",
            employmentType: "Permanent",
          },
        ],
        // // 你可以通过treeDataOptions自定义树的行为
        // treeDataOptions: {
        //   // 指定父子关系的字段名
        //   children: "children",
        //   // 指定每个节点唯一标识的字段名
        //   key: function (node) {
        //     return node.id;
        //   },
        // },
        getDataPath: (date) => {
          return date.orgHierarchy;
        },
      },
    };
  },
  methods: {},
};
</script>

<style lang="less" scoped></style>
