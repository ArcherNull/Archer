<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-04-22 15:42:55
 * @LastEditTime: 2024-07-18 18:00:55
 * @Description: 
-->
<template>
  <div class="BasePage">
    <div class="BasePage-header">
      <!-- 查询区域 -->
      <div class="BasePage-header-query">
        <BLHeaderSearch
          :header-search-config="headerSearchConfig"
          :ag-query-params="agQueryParams"
          ref="BLHeaderSearch"
          :get-list="getList"
          :search-reset="searchReset"
        />
      </div>

      <!-- 操作按钮区域 -->
      <div class="BasePage-header-btn">
        <BLHeaderBtn
          :row-selected-list="rowSelectedList"
          :btn-config-list="btnConfigList"
          @headerBtnOperation="headerBtnOperation"
        />
      </div>
    </div>

    <AgGridTable
      :ag-table-options="{
        ...agTableOptions,
        gridOptions: getCustmoerGridOptions,
        defaultColDef: getCustomerDefaultColDef,
      }"
      :ag-table-switch="{
        isScrollEndRequest: true,
        drawerDoubleShow: true,
      }"
      :query-params="agQueryParams"
      @getRowData="getRowData"
      @getGridApi="getGridApi"
      @rowSelected="rowSelected"
      @requestNextPage="requestNextPage"
    />

    <!-- 编辑新增用户 -->
    <AddUser
      :visible.sync="openAddUser"
      :rowInfo="selectedRowInfo"
      @success="searchQuery"
    ></AddUser>
  </div>
</template>

<script>
import AgGridTableMixins from "@/components/AgGridTable/agTableMixins/index";
import {
  getUserInfoList,
  batchDelUserInfo,
  batchEditUserState,
} from "@/api/index.js";
import AgRowActionBtn from "./components/AgRowActionBtn/index.vue";

export default {
  name: "BasePage",
  mixins: [AgGridTableMixins],
  components: {
    // eslint-disable-next-line vue/no-unused-components
    AgRowActionBtn,
    AddUser: () => import("./components/AddUser/index.vue"),
  },
  data() {
    return {
      // 头部搜索配置
      headerSearchConfig: {
        displayIndex: 2,
        main: [
          {
            type: "fuzzySearch",
            field: "searchVal",
            selectField: "inField",
            defaultValue: undefined,
            selectDefaultValue: "userName",
            options: [
              {
                label: "用户名称",
                value: "userName",
              },
              {
                label: "真实姓名",
                value: "realName",
              },
              {
                label: "身份证号",
                value: "idCardNo",
              },
              {
                label: "邮箱",
                value: "email",
              },
              {
                label: "手机号码",
                value: "phoneNumber",
              },
            ],
          },
          {
            type: "dateTimeSearch",
            field: "dateTime",
            selectField: "commonTime",
            defaultValue: undefined,
            selectDefaultValue: "startTime,endTime",
            options: [
              {
                label: "创建时间",
                value: "startTime,endTime",
              },
              {
                label: "更新时间",
                value: "updateTime",
              },
            ],
          },
          {
            type: "select",
            field: "sex",
            defaultValue: undefined,
            placeholder: "请选择用户性别",
            options: [
              {
                label: "男",
                value: 1,
              },
              {
                label: "女",
                value: 0,
              },
            ],
          },
          {
            type: "select",
            field: "userState",
            defaultValue: undefined,
            placeholder: "请选择用户状态",
            options: [
              {
                label: "禁用",
                value: 0,
              },
              {
                label: "启用",
                value: 1,
              },
            ],
          },
          {
            type: "select",
            field: "authState",
            defaultValue: undefined,
            placeholder: "请选择认证状态",
            options: [
              {
                label: "未实名",
                value: 0,
              },
              {
                label: "认证中",
                value: 1,
              },
              {
                label: "已实名",
                value: 2,
              },
              {
                label: "认证失败",
                value: 3,
              },
            ],
          },
          {
            type: "select",
            field: "userRole",
            defaultValue: undefined,
            placeholder: "请选择用户角色",
            options: [
              {
                label: "超级管理员",
                value: "超级管理员",
              },
              {
                label: "管理员",
                value: "管理员",
              },
              {
                label: "普通用户",
                value: "普通用户",
              },
            ],
          },
          {
            type: "select",
            field: "registerFrom",
            defaultValue: undefined,
            placeholder: "请选择用户注册于",
            options: [
              {
                label: "官网",
                value: 0,
              },
              {
                label: "小程序",
                value: 1,
              },
              {
                label: "pc管理端",
                value: 2,
              },
            ],
          },
        ],
      },

      // 头部操作按钮列表配置
      btnConfigList: [
        {
          btnText: "新增用户",
          type: "primary",
          power: "getTransportNode",
        },
        {
          btnText: "审批实名",
          type: "primary",
          power: "approvalIdentify",
        },
        {
          btnText: "批量操作",
          btnType: "dropdown",
          afterIcon: "down",
          ghost: true,
          power: "batchOperation",
          menuItems: [
            {
              btnText: "删除",
              icon: "delete",
              style: "color:red;",
              power: "batchDelete",
            },
            {
              btnText: "禁用",
              icon: "lock",
              power: "batchDisabled",
            },
            {
              btnText: "启用",
              style: "color:green",
              icon: "unlock",
              power: "batchEnabled",
            },
          ],
        },
      ],

      // ag-grid表格字段配置
      fieldsConfig: {
        name: "用户管理",
        // 页面中如果有多表，需要字段设置用
        id: "userManage",

        // 表头
        database: {
          用户名称: "userName",
          用户图片: "userImg",
          用户角色: "userRole",
          用户状态: "userState",
          认证状态: "authState",
          真实姓名: "realName",
          身份证号: "idCardNo",
          手机号码: "phoneNumber",
          性别: "sex",
          生日: "birthday",
          年龄: "age",
          邮箱: "email",
          省份: "province",
          城市: "city",
          "区/县": "area",
          详细地址: "address",
          备注: "remark",
          注册于: "registerFrom",
          用户标签: "userTags",
          创建时间: "createdAt",
          更新时间: "updatedAt",
        },
        specColumns: [
          {
            headerName: "用户名称",
            field: "userName",
            headerClass: (params) => {
              const columnName = params.colDef.headerName;

              if (columnName === "用户名称") {
                return "firstSpecialStyles";
              }
              return "firstcommonStyles";
            },
          },
          {
            headerName: "认证状态",
            field: "authState",
            cellRenderer: (params) => {
              if (params.node.rowPinned === "bottom") return;
              return params.value === 0
                ? "未实名"
                : params.value === 1
                ? "认证中"
                : params.value === 2
                ? "已实名"
                : params.value === 3
                ? "认证失败"
                : "";
            },
          },
          {
            headerName: "用户状态",
            field: "userState",
            cellRenderer: (params) => {
              if (params.node.rowPinned === "bottom") return;
              return params.value == 1
                ? `<span style="color:yellowgreen;font-weight:bold;">启用</span>`
                : params.value === 0
                ? `<span style="color:tomato;font-weight:bold;">禁用</span>`
                : `<span style="color:tomato;font-weight:bold;">注销</span>`;
            },
          },
          {
            headerName: "性别",
            field: "sex",
            cellRenderer: (params) => {
              if (params.node.rowPinned === "bottom") return;
              return params.value === 0 ? "女" : "男";
            },
          },
          {
            headerName: "注册于",
            field: "registerFrom",
            cellRenderer: (params) => {
              if (params.node.rowPinned === "bottom") return;
              return params.value === 0
                ? "官网"
                : params.value === 1
                ? "小程序"
                : "pc管理端";
            },
          },
        ],

        actionColumns: [
          {
            headerName: "操作",
            field: "agTableAction",
            width: 170,
            cellRendererFramework: "AgRowActionBtn",
          },
        ],
      },

      // 选中的行数据
      selectedRowInfo: null,

      openAddUser: false,
    };
  },

  methods: {
    // 获取表格自定义gridOptions
    getCustmoerGridOptions(e) {
      const gridOptions = {
        rowHeight: 80,
        headerHeight: 60,
        rowStyle: { backgroundColor: "#efefef" },
        getRowHeight: function (params) {
          if (params.node.rowPinned === "bottom") {
            return 36;
          } else {
            return 80;
          }
        },
      };
      return gridOptions;
    },

    // 获取列的默认设置
    getCustomerDefaultColDef() {
      return {
        cellStyle: function (params) {
          if (params.node.rowPinned === "bottom") {
            return { color: "#333", "line-height": "36px", height: "36px" }; // 列的单元格默认样式
          } else {
            return { "line-height": "80px" }; // 列的单元格默认样式
          }
        },
      };
    },

    // 查询
    searchQuery(pageNum) {
      this.$refs.BLHeaderSearch.searchQuery(pageNum);
    },

    // 请求接口
    getList(params) {
      const { pageSize, pageNum, filterChangedObj } = this.agQueryParams;
      // 使用真实字段
      this.agQueryParams.queryParam.isRealField = true;
      this.agQueryParams.getDataLoading = true;
      if (pageNum === 1) {
        this.agTableOptions.rowData = null;
      }
      this.rowSelectedList = null;
      getUserInfoList({
        pageSize,
        pageNum,
        queryParams: {
          ...(params || {}),
          ...(filterChangedObj.filterObj || {}),
        },
      })
        .then((res) => {
          console.log("res123======>", res);

          if (res?.code === 200) {
            const { data: rows, total = 0, pages } = res;
            this.agQueryParams.total = total;
            this.agQueryParams.totalPages = pages;

            if (pageNum <= 1) {
              this.agTableOptions.rowData = Object.freeze(rows);
            } else {
              // 此方式会导致滚动条回到初始位置
              this.agTableOptions.rowData = Object.freeze([
                ...this.agTableOptions.rowData,
                ...rows,
              ]);

              // this.gridApi.updateRowData({ add: list })
            }
          } else {
            this.$message.error(res.message || "查询列表失败");
          }
        })
        .finally(() => {
          this.agQueryParams.getDataLoading = false;
        });
    },

    // 表格行数据操作方法
    agTableRowOperation(item) {
      const { params, btnText } = item;
      console.log("params", params);
      const rowInfo = params.data;
      this.selectedRowInfo = rowInfo;
      switch (btnText) {
        case "编辑":
          console.log("编辑");
          this.openEditUserFun(rowInfo);
          break;
        case "禁用":
          console.log("禁用");
          this.toggleStatus([rowInfo], 0);
          break;
        case "启用":
          console.log("启用");
          this.toggleStatus([rowInfo], 1);
          break;
        case "删除":
          console.log("删除");
          this.deleteConfirm(rowInfo.id);
          break;
      }
    },

    // 打开编辑
    openEditUserFun(rowInfo) {
      this.selectedRowInfo = rowInfo;
      this.openAddUser = true;
    },

    // 启用/禁用
    toggleStatus(rowList, userState) {
      console.log("启用/禁用", rowList);
      console.log("启用/userState", userState);
      if (rowList?.length) {
        const that = this;
        const ids = rowList.map((ele) => ele.id).join(",");
        const actionText = userState === 0 ? "禁用" : "启用";
        this.$confirm({
          title: "温馨提示",
          content: `您确认${actionText}吗`,
          onOk: async function () {
            console.log("提交");
            const res = await batchEditUserState({
              ids,
              userState,
            });
            if (res.code === 200) {
              that.$message.success(`${actionText}成功`);
              that.getList(that.agQueryParams.queryParam);
            } else {
              that.$message.warning(res.message || `${actionText}失败`);
            }
          },
        });
      } else {
        this.$message.warning("未选择行数据");
      }
    },

    // 删除
    deleteConfirm(ids) {
      const that = this;
      this.$confirm({
        title: "操作确认",
        content: `删除后无法恢复，您是否确认删除?`,
        onOk: async function () {
          console.log("提交");
          const res = await batchDelUserInfo({
            ids,
          });
          if (res.code === 200) {
            that.$message.success("删除成功");
            that.getList(that.agQueryParams.queryParam);
          } else {
            that.$message.warning(res.message || "删除失败");
          }
        },
      });
    },
    // 批量删除
    batchDelData(rowList) {
      if (rowList?.length) {
        const ids = rowList.map((ele) => ele.id).join(",");
        this.deleteConfirm(ids);
      } else {
        this.$message.warning("未选择数据");
      }
    },

    // 头部按钮操作
    headerBtnOperation(item) {
      console.log("头部按钮操作", item);
      const { btnText } = item;

      console.log("this.rowSelectedList", this.rowSelectedList);

      switch (btnText) {
        case "新增用户":
          console.log("新增用户");
          this.selectedRowInfo = null;
          this.openAddUser = true;
          break
        case "删除":
          console.log("删除");
          break;
        case "禁用":
          console.log("禁用");
          break;
        case "启用":
          console.log("启用");
          break;
        case "批量操作-删除":
          console.log("批量操作-删除");
          this.batchDelData(this.rowSelectedList);
          break;
        case "批量操作-禁用":
          console.log("批量操作-禁用");
          this.toggleStatus(this.rowSelectedList, 0);
          break;
        case "批量操作-启用":
          console.log("批量操作-启用");
          this.toggleStatus(this.rowSelectedList, 1);
          break;
      }
    },
  },
};
</script>

<style>
/*  有两层表头时，第一层表头是基础信息时渲染的颜色  */
.firstSpecialStyles {
  color: blueviolet;
  background-color: salmon;
}

/*  有两层表头时，第一层表头不是基础信息时渲染的颜色  */
.firstcommonStyles {
  color: red;
  background-color: gold;
  font-size: larger;
}
</style>

<style lang="less" scoped>
.BasePage {
  &-header {
    background-color: #fff;
    padding: 10px;
    margin-bottom: 10px;
  }
}
</style>
