<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-04-03 11:57:04
 * @LastEditTime: 2024-07-17 01:17:48
 * @Description: 忘记密码
-->
<template>
  <BLModal
    class="RegisterForm"
    title="字典管理"
    :visible="visible"
    :okButtonProps="{ htmlType: 'submit' }"
    :confirmLoading="submitLoading"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <div>
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
        :ag-table-options="agTableOptions"
        :ag-table-switch="{
          isScrollEndRequest: true,
          isShowExcelDownload: true,
          drawerDoubleShow: true,
        }"
        :query-params="agQueryParams"
        @getRowData="getRowData"
        @getGridApi="getGridApi"
        @rowSelected="rowSelected"
        @requestNextPage="requestNextPage"
      />
    </div>
  </BLModal>
</template>

<script>
import AgGridTableMixins from "@/components/AgGridTable/agTableMixins/index";
import { getDictList, delDict } from "@/api/index.js";
import AgRowActionBtn from "./AgRowActionBtn.vue";

export default {
  name: "ResetPwdDialog",
  mixins: [AgGridTableMixins],
  components: {
    // eslint-disable-next-line vue/no-unused-components
    AgRowActionBtn,
  },
  props: {
    // 弹窗显示隐藏
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // 提交loading
      submitLoading: false,

      // 头部搜索配置
      headerSearchConfig: {
        displayIndex: 2,
        main: [
          {
            type: "fuzzySearch",
            field: "searchVal",
            selectField: "inField",
            defaultValue: undefined,
            selectDefaultValue: "dicLabel",
            options: [
              {
                label: "字典label",
                value: "dicLabel",
              },
              {
                label: "字典value",
                value: "dicValue",
              },
            ],
          },
          {
            type: "select",
            field: "dicState",
            defaultValue: undefined,
            placeholder: "请选择状态",
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
        ],
      },

      // 头部操作按钮列表配置
      btnConfigList: [
        {
          btnText: "新增",
          type: "primary",
          power: "getTransportNode",
        },
      ],

      // ag-grid表格字段配置
      fieldsConfig: {
        name: "网点管理",
        // 页面中如果有多表，需要字段设置用
        id: "transportNode",

        style: {
          height: "350px",
        },

        // 表头
        database: {
          字典label: "dicLabel",
          字典value: "dicValue",
          额外参数: "dicExtraParams",
          备注: "dicRemark",
          状态: "dicState",
          创建人: "createBy",
          创建时间: "createdAt",
          更新时间: "updatedAt",
        },
        specColumns: [],
        actionColumns: [
          {
            headerName: "操作",
            field: "agTableAction",
            width: 170,
            cellRendererFramework: "AgRowActionBtn",
          },
        ],
      },
    };
  },
  methods: {
    // 取消
    handleCancel() {
      this.$emit("update:visible", false);
    },
    // 提交表单
    handleSubmit() {
      console.log("提交表单");
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
      getDictList({
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
        case "删除":
          console.log("删除");
          break;
        case "禁用":
          console.log("禁用");
          break;
        case "启用":
          console.log("启用");
          break;
      }
    },
  },
};
</script>

<style lang="less" scoped></style>
