<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-21 14:40:37
 * @LastEditTime: 2024-07-22 23:40:21
 * @Description: 电子围栏
-->

<template>
  <div class="ElectronicFence">
    <div class="ElectronicFence-header">
      <!-- 查询区域 -->
      <div class="ElectronicFence-header-query">
        <BLHeaderSearch
          ref="BLHeaderSearch"
          :header-search-config="headerSearchConfig"
          :ag-query-params="agQueryParams"
          :get-list="getList"
          :search-reset="searchReset"
        />
      </div>

      <!-- 操作按钮区域 -->
      <div class="ElectronicFence-header-btn">
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

    <!-- 添加电子围栏 -->
    <AddFenceDialog
      :visible.sync="openAddFenceDialog"
      :rowInfo="selectedAddFenceRowInfo"
      @success="searchQuery"
    ></AddFenceDialog>
  </div>
</template>

<script>
import AgRowActionBtn from "./components/AgRowActionBtn/index.vue";
import AgGridTableMixins from "@/components/AgGridTable/agTableMixins/index";
import {
  getElectronicFenceList,
  batchDelElectronicFence,
  getMultiDictItems,
} from "@/api/index.js";

export default {
  name: "ElectronicFence",
  components: {
    // eslint-disable-next-line vue/no-unused-components
    AgRowActionBtn,
    AddFenceDialog: () => import("./components/AddFenceDialog/index.vue"),
  },
  mixins: [AgGridTableMixins],
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
            selectDefaultValue: "name",
            options: [
              {
                label: "围栏名称",
                value: "name",
              },
              {
                label: "围栏编码",
                value: "code",
              },
            ],
          },
          {
            type: "select",
            field: "type",
            defaultValue: undefined,
            placeholder: "请选择围栏类型",
            options: [],
          },
          {
            type: "select",
            field: "category",
            defaultValue: undefined,
            placeholder: "请选择围栏类别",
            options: [],
          },
        ],
      },

      // 头部操作按钮列表配置
      btnConfigList: [
        {
          btnText: "新增",
          type: "primary",
          power: "add",
        },
        {
          btnText: "批量删除",
          type: "danger",
          ghost: true,
          loading: false,
          power: "batchDelete",
        },
        {
          btnText: "导入",
          power: "import",
        },
      ],

      // ag-grid表格字段配置
      fieldsConfig: {
        name: "电子围栏",
        // 页面中如果有多表，需要字段设置用
        id: "ElectronicFence",

        // 表头
        database: {
          围栏编码: "code",
          围栏名称: "name",
          围栏类型: "type",
          围栏类别: "category",
          半径: "radius",
          面积: "size",
          经度: "longitude",
          纬度: "latitude",
          详细地址: "address",
          备注: "remark",
          创建人: "createBy",
          创建时间: "createdAt",
          更新人: "updateBy",
          更新时间: "updatedAt",
        },
        specColumns: [],
        actionColumns: [
          {
            headerName: "操作",
            field: "agTableAction",
            width: 120,
            cellRendererFramework: "AgRowActionBtn",
          },
        ],
      },

      // 弹窗打开选中的行数据
      dialogSelectedRowInfo: null,

      // 打开新增电子围栏
      openAddFenceDialog: false,
      // 选择电子围栏行数据
      selectedAddFenceRowInfo: null,

      dictObj: {
        5: [],
        26: [],
      },
    };
  },
  created() {
    this.getDicItems();
  },
  methods: {
    // 查询
    searchQuery(pageNo) {
      this.$refs.BLHeaderSearch.searchQuery(pageNo);
    },

    // 获取字段数据
    async getDicItems() {
      const dictObj = {
        5: [],
        26: [],
      };
      const ids = Object.keys(dictObj).join(",");
      const res = await getMultiDictItems(ids);
      const resData = res?.data || [];
      resData.forEach((ele) => {
        if (ele.dicBindId) {
          ele.label = ele.dicLabel;
          ele.value = ele.dicValue;
          dictObj[ele.dicBindId].push(ele);
        }
      });
      this.dictObj = dictObj;
      this.headerSearchConfig.main[1].options = dictObj["26"];
      this.headerSearchConfig.main[2].options = dictObj["5"];

      console.log("dictObj=====>", dictObj);
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
      getElectronicFenceList({
        pageSize,
        pageNum,
        queryParams: {
          ...(params || {}),
          ...(filterChangedObj.filterObj || {}),
        },
      })
        .then((res) => {
          if (res.code === 200) {
            console.log("res======>", res);
            const { data: rows, total = 0, pages } = res;

            this.agQueryParams.total = total;
            this.agQueryParams.totalPages = pages;

            if (pageNum <= 1) {
              this.agTableOptions.rowData = rows;
            } else {
              // 此方式会导致滚动条回到初始位置
              this.agTableOptions.rowData = [
                ...this.agTableOptions.rowData,
                ...rows,
              ];
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
      switch (btnText) {
        case "修改":
          console.log("修改");
          this.openEditAddFenceDialog(rowInfo);
          break;
        case "删除":
          console.log("删除");
          this.deleteConfirm(rowInfo.id);
          break;
      }
    },
    // 打开修改弹窗
    openEditAddFenceDialog(rowInfo) {
      this.selectedAddFenceRowInfo = rowInfo;
      this.openAddFenceDialog = true;
    },
    // 删除
    deleteConfirm(ids) {
      const that = this;
      this.$confirm({
        title: "操作确认",
        content: `删除后无法恢复，您是否确认删除?`,
        onOk: function () {
          console.log("提交");
          batchDelElectronicFence({
            ids,
          }).then((res) => {
            if (res.code === 200) {
              that.$message.success("删除成功");
              that.searchQuery();
            }
          });
        },
      });
    },
    // 删除
    batchDeleteConfirm() {
      const rowData = this.rowSelectedList;
      if (rowData.length <= 0) {
        this.$message.warning("请至少选择一条数据");
        return;
      }
      const idsList = rowData.map((ele) => ele.id);
      const ids = idsList.join(",");
      const that = this;
      this.$confirm({
        title: "操作确认",
        content: `删除后无法恢复，您是否确认删除?`,
        onOk: async function () {
          console.log("提交");
          const res = await batchDelElectronicFence({
            ids,
          });
          if (res.code === 200) {
            that.$message.success("删除成功");
            that.searchQuery();
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
      if (["删除", "方案配置", "自动打卡开启", "批量删除"].includes(btnText)) {
        if (!(this.rowSelectedList && this.rowSelectedList.length)) {
          this.$message.warning("未选中行数据");
          return;
        }
      }

      console.log("this.rowSelectedList", this.rowSelectedList);

      switch (btnText) {
        case "新增":
          console.log("新增");
          this.selectedAddFenceRowInfo = null;
          this.openAddFenceDialog = true;
          break;
        case "下载模板":
          console.log("下载模板");
          break;
        case "导入":
          console.log("导入");
          break;
        case "批量删除":
          console.log("批量删除");
          this.batchDeleteConfirm();
          break;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.ElectronicFence {
  &-header {
    background-color: #fff;
    padding: 10px;
    margin-bottom: 10px;
  }
}
</style>
