<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-01-25 15:59:32
 * @LastEditTime: 2024-07-25 00:36:55
 * @Description: ag-grid-vue二次封装
 *
 * 参考文档：
 * 官网：https://www.ag-grid.com/
 * ag-grid官网的demo :https://www.ag-grid.com/example.php
 * ag-grid中文教程：https://www.itxst.com/ag-grid/tutorial.html
-->
<template>
  <div class="AgGridTable">
    <div class="AgGridTable-container" v-if="agGridId">
      <div
        id="AgGridTable-box"
        v-myLoading="tableLoading"
        class="AgGridTable-box"
        :style="agGridVueStyle"
      >
        <AgGridVue
          v-if="queryParams.initTableSuccess"
          :id="agGridId"
          :style="agGridVueStyle"
          :class="[`ag-theme-${agTableOptions.theme || defaultTheme}`]"
          :grid-options="cusAgTableOptions()"
          :default-col-def="cusDefaultColDef()"
          :column-defs="agTableOptions.columnDefs"
          :row-data="agTableOptions.rowData"
          :tree-column="agTableOptions.treeColumn || 0"
          :enable-col-resize="true"
          :row-selection="rowSelection"
          :enableBrowserTooltips="true"
          @getVerticalPixelRange="getVerticalPixelRange"
          @rowClicked="rowClicked"
          @rowDoubleClicked="rowDoubleClicked"
          @rowSelected="rowSelected"
          @cellFocused="onCellFocused"
          @cellContextMenu="onCellContextMenu"
          @gridReady="onGridReady"
          @paginationChanged="paginationChanged"
          @rowDataUpdated="OnRowDataUpdatedEvent"
          @cell-clicked="onCellClicked"
          @cellEditingStopped="cellEditingStopped"
          @columnVisible="onColumnVisible"
          @cellDoubleClicked="onCellDoubleClicked"
          @selection-changed="onSelectionChanged"
          @filterChanged="FilterChangedEvent"
          @bodyScrollEnd="bodyScrollEnd"
          @cellClicked="onCellClicked"
        />

        <!--
        表格注册vue组件传参，未测试通过
        :frameworkComponents="agTableOptions.frameworkComponents"
        @agGridEvent="handleAGGridEvent"
      --></div>
      <!-- 底部分页以及条件查询 -->
      <div v-if="queryParams.initTableSuccess" class="AgGridTable-pagation">
        <!-- 分页 -->
        <a-pagination
          v-if="showPagination"
          class="AgGridTable-pagation-com"
          :total="queryParams.total || 0"
          :page-size-options="pageSizeArr"
          :current="queryParams.pageNum || 1"
          :page-size="queryParams.pageSize || 0"
          :disabled="queryParams.getDataLoading"
          show-size-changer
          :show-total="
            (total) =>
              `${queryParams.pageNum || 1}页/${
                queryParams.totalPages || 0
              }页；共${total}条`
          "
          @showSizeChange="showSizeChange"
          @change="paginationChange"
        />

        <!-- 设置 -->
        <div v-if="showFieldsSet" class="AgGridTable-pagation-fieldsSet">
          <FieldsSet
            :fields-set-id="agGridId"
            :init-column-defs="agTableOptions.initColumnDefs"
            @success="setFieldsSuccess"
          />
        </div>

        <!-- 前端导出默认excel[xlsx] -->
        <div
          v-if="showExportExcelXlsxFile"
          class="AgGridTable-pagation-download"
        >
          <a-button title="前端导出默认excel" @click="exportExcelFun()">
            <a-icon type="file-excel" />
          </a-button>
        </div>

        <!-- 前端导出默认excel[xlsx] -->
        <div
          v-if="showExportExcelBlobByBackEnd"
          class="AgGridTable-pagation-download"
        >
          <a-button
            title="后端导出默认excel的文件流"
            @click="exportExcelBlobByBackEndFun()"
          >
            <a-icon type="file-excel" />
          </a-button>
        </div>

        <!-- 前端导出默认excel[csv] -->
        <div
          v-if="showExportExcelCsvFile"
          class="AgGridTable-pagation-download"
        >
          <a-button title="前端导出默认excel[csv]" @click="exportExcelCSVFun()">
            <a-icon type="file-excel" />
          </a-button>
        </div>

        <!-- 前端导出带样式excel[xlsx] -->
        <div
          v-if="showExportExcelStyleXlsxFile"
          class="AgGridTable-pagation-download"
        >
          <a-button title="前端导出带样式excel" @click="exportStyleExcelFun()">
            <a-icon type="file-excel" />
          </a-button>
        </div>

        <!-- 前端导出PDF -->
        <div v-if="showExportPdfFile" class="AgGridTable-pagation-download">
          <a-button title="前端导出PDF" @click="exportPDFFun()">
            <a-icon type="file-pdf" />
          </a-button>
        </div>

        <!-- 前端导出Html PDF -->
        <div v-if="showExportHtmlPdfFile" class="AgGridTable-pagation-download">
          <a-button title="前端导出Html PDF" @click="exportHTMLPDFFun()">
            <a-icon type="file-pdf" />
          </a-button>
        </div>

        <!-- 前端导出TXT -->
        <div v-if="showExportTextFile" class="AgGridTable-pagation-download">
          <a-button title="前端导出TXT" @click="exportTXTFun()">
            <a-icon type="file-word" />
          </a-button>
        </div>

        <!-- 前端导出JSON -->
        <div v-if="showExportJsonFile" class="AgGridTable-pagation-download">
          <a-button title="前端导出JSON" @click="exportJSONFun()">
            <a-icon type="file-word" />
          </a-button>
        </div>

        <!-- 导入 -->
        <div v-if="showImportFieldsBtn" class="AgGridTable-pagation-upload">
          <a-button title="导入" @click="openParsingExcelModel = true">
            <a-icon type="cloud-upload" />
          </a-button>
        </div>

        <!-- 列头筛选值列表 -->
        <MyFieldsTagList
          v-if="showMyFieldsTagList"
          :tags-obj="queryParams.filterChangedObj.field"
          @closeTag="closeTag"
        />
      </div>
      <!-- 侧边抽屉 -->
      <a-drawer
        v-if="showAgGridDrawer"
        title="详情"
        :modal="false"
        class="my-agGrid-drawer"
        :visible="openAgRowDataDetailDrawer"
        :body-style="{ padding: '0px' }"
        :get-container="getDrawerContainer"
        :mask="true"
        placement="right"
        @close="closeAgGridDrawer"
      >
        <div class="my-agGrid-detail">
          <div
            v-for="(item, index) in agTableOptions.initColumnDefs
              .sortabledFields"
            :key="index"
            class="ag-grid-drawer"
          >
            <div class="title">{{ item.headerName }}</div>
            <div class="context">{{ agRowDataDetailData[item.field] }}</div>
          </div>
        </div>
      </a-drawer>

      <!-- 导入弹窗 -->
      <ParsingExcelModel
        :visible.sync="openParsingExcelModel"
      ></ParsingExcelModel>
    </div>
    <div class="AgGridTable-renderTable" :style="agGridVueStyle" v-else>
      疯狂加载中...
    </div>
  </div>
</template>
<script>
import { isObject } from "lodash";
import MyFieldsTagList from "./components/MyFieldsTagList/index.vue";
import FieldsSet from "./components/FieldsSet/index.vue";
import ParsingExcelModel from "./components/ParsingExcelModel/index.vue";
import { AgGridVue } from "ag-grid-vue";
import agGridMixins from "./common/agGrid-mixins";
import { EXCEL } from "./common/EXCEL/index";
import { exportPDFFile } from "./common/PDF/index";
import { downloadByATag } from "./common/utils/index";
import { htmlPdf } from "./common/PDF/htmlPdf";
import { downLoadTableTxtFile } from "./common/TXT/index";

import { AG_GRID_DEFAULT_THEME } from "./common/agGrid-config";
import { downLoadJsonFile } from "./common/JSON/index";

import { exportExcelBolb } from "@/api/index";

// 引入ag-grid-vue 主题样式
import "ag-grid-community/styles/ag-grid.css"; // 基础表格样式

import "ag-grid-community/styles/ag-theme-balham.css"; // balham

import "ag-grid-community/styles/ag-theme-alpine.css"; // alpine

import "ag-grid-community/styles/ag-theme-material.css"; // material

export default {
  name: "AgGridTable",
  components: {
    AgGridVue,
    MyFieldsTagList,
    FieldsSet,
    ParsingExcelModel,
  },
  mixins: [agGridMixins],
  props: {
    agTableOptions: {
      type: Object,
      default: () => {},
    },
    // 数据选择方式，单选single/多选multiple
    rowSelection: {
      type: String,
      default: "multiple",
    },
    // 表格开关配置
    agTableSwitch: {
      type: Object,
      default() {
        return {
          // 是否展示分页组件
          isShowPagination: true,
          // 筛选栏请求开关
          isFilterChangedRequest: false,
          // 滚动到底请求
          isScrollEndRequest: false,
          // 导入开关
          isShowExcelUpload: false,
          // 详情侧边抽屉开关
          drawerDoubleShow: false,

          // 前端导出开关
          isShowExportExcelXlsxBtn: false,
          isExportExcelBlobByBackBtn: false,
          isShowExportExcelCsvFile: false,
          isShowExportExcelStyleXlsxFile: false,
          isShowExportPdfFile: false,
          isShowExportHtmlPdfFile: false,
          isShowExportTextFile: false,
          isShowExportJsonFile: false,
          isShowExcelUpload: false,
        };
      },
    },
    // 分页请求数据
    queryParams: {
      type: Object,
      default() {
        return {
          getDataLoading: false,
          initTableSuccess: false,
          totalPages: 0,
          total: 0,
          pageNum: 1,
          pageSize: 100,
          filterChangedObj: {},
        };
      },
    },
  },
  data() {
    return {
      pageSizeArr: [
        "100",
        "200",
        "500",
        "1000",
        "2000",
        "3000",
        "5000",
        "10000",
        "12000",
        "15000",
        "20000",
        "40000",
        "60000",
        "80000",
        "100000",
        "120000",
        "140000",
      ],
      // 打开侧边栏抽屉drawer
      openAgRowDataDetailDrawer: false,
      agRowDataDetailData: null,
      // 默认主题
      defaultTheme: AG_GRID_DEFAULT_THEME,

      // 悬浮选中的cell
      hoveredCell: null,

      cellIdCounter: 0, // 用于生成唯一ID的计数器

      openParsingExcelModel: false,
    };
  },
  computed: {
    // 表格loading
    tableLoading() {
      const { getDataLoading, initTableSuccess } = this.queryParams;
      return initTableSuccess ? getDataLoading : true;
    },
    // 表格唯一id
    agGridId() {
      if (this.agTableOptions && this.agTableOptions.initColumnDefs) {
        const { agGridTableId } = this.agTableOptions.initColumnDefs;

        console.log("agGridTableId=====>", agGridTableId);

        return agGridTableId;
      } else {
        console.error("[agGridId]表格唯一id生成失败");
        return "";
      }
    },
    // 展示字段设置
    showFieldsSet() {
      const { columnDefs, initColumnDefs } = this.agTableOptions;
      if (initColumnDefs && columnDefs) {
        const { sortabledFields } = initColumnDefs;
        return (
          columnDefs &&
          columnDefs.length &&
          sortabledFields &&
          sortabledFields.length
        );
      } else {
        return false;
      }
    },
    // 展示分页组件
    showPagination() {
      const { isShowPagination = true } = this.agTableSwitch;
      return isShowPagination && this.showFieldsSet;
    },
    // 展示快捷前端导出Excel中的xlsx按钮
    showExportExcelXlsxFile() {
      const { isShowExportExcelXlsxBtn = true } = this.agTableSwitch;
      return isShowExportExcelXlsxBtn && this.showFieldsSet;
    },
    // 后端导出默认excel的文件流
    showExportExcelBlobByBackEnd() {
      const { isExportExcelBlobByBackBtn = true } = this.agTableSwitch;
      return isExportExcelBlobByBackBtn && this.showFieldsSet;
    },
    // 展示快捷前端导出Excel中的csv按钮
    showExportExcelCsvFile() {
      const { isShowExportExcelCsvFile = false } = this.agTableSwitch;
      return isShowExportExcelCsvFile && this.showFieldsSet;
    },
    // 展示快捷前端导出Excel中含style的xlsx按钮
    showExportExcelStyleXlsxFile() {
      const { isShowExportExcelStyleXlsxFile = false } = this.agTableSwitch;
      return isShowExportExcelStyleXlsxFile && this.showFieldsSet;
    },
    // 展示快捷前端导出PDF按钮
    showExportPdfFile() {
      const { isShowExportPdfFile = false } = this.agTableSwitch;
      return isShowExportPdfFile && this.showFieldsSet;
    },
    // 展示快捷前端导出html PDF按钮
    showExportHtmlPdfFile() {
      const { isShowExportHtmlPdfFile = false } = this.agTableSwitch;
      return isShowExportHtmlPdfFile && this.showFieldsSet;
    },
    // 展示快捷前端导出text按钮
    showExportTextFile() {
      const { isShowExportTextFile = false } = this.agTableSwitch;
      return isShowExportTextFile && this.showFieldsSet;
    },
    // 展示快捷前端导出json按钮
    showExportJsonFile() {
      const { isShowExportJsonFile = false } = this.agTableSwitch;
      return isShowExportJsonFile && this.showFieldsSet;
    },
    // 展示快捷导入按钮设置
    showImportFieldsBtn() {
      const { isShowExcelUpload = false } = this.agTableSwitch;
      return isShowExcelUpload && this.showFieldsSet;
    },
    // 展示快捷前端导出按钮设置
    showMyFieldsTagList() {
      const { isFilterChangedRequest = false } = this.agTableSwitch;
      return isFilterChangedRequest && this.showFieldsSet;
    },
    // 展示侧边栏详情
    showAgGridDrawer() {
      const { drawerDoubleShow } = this.agTableSwitch;
      const { initColumnDefs } = this.agTableOptions;
      const { initTableSuccess } = this.queryParams;

      return (
        drawerDoubleShow &&
        this.agRowDataDetailData &&
        initTableSuccess &&
        initColumnDefs.sortabledFields &&
        initColumnDefs.sortabledFields.length
      );
    },
    // 表格样式
    agGridVueStyle() {
      const { style } = this.agTableOptions;
      return style || { height: "600px", width: "100%" };
    },
  },

  methods: {
    // 自定义agTableOptions
    cusAgTableOptions() {
      const { gridOptions } = this.agTableOptions;

      if (gridOptions && typeof gridOptions === "function") {
        const cGridOptions = gridOptions();
        if (isObject(cGridOptions)) {
          return Object.assign(this.gridOptions, cGridOptions);
        } else {
          return this.cloneGridOptions;
        }
      } else {
        return this.cloneGridOptions;
      }
    },
    // 自定义设置defaultColDef
    cusDefaultColDef() {
      const { defaultColDef } = this.agTableOptions;
      if (defaultColDef && typeof defaultColDef === "function") {
        const cDefaultColDef = defaultColDef();
        if (isObject(cDefaultColDef)) {
          return Object.assign(this.defaultColDef, cDefaultColDef);
        } else {
          return this.cloneDefaultColDef;
        }
      } else {
        return this.cloneDefaultColDef;
      }
    },
    // 分页查询
    showSizeChange(current, pageSize) {
      console.log("分页查询", current, pageSize);
      this.queryParams.pageNum = 1;
      this.queryParams.pageSize = pageSize;
      this.$emit("requestNextPage", 1);
    },

    // 分页改变
    paginationChange(ele) {
      console.log("分页改变", ele);
      if (
        this.queryParams.pageNum < ele &&
        this.queryParams.totalPages >= ele
      ) {
        this.$emit("requestNextPage", ele);
      }
    },

    // 关闭标签
    closeTag(item) {
      console.log("关闭标签", item);
      if (item && this.queryParams.filterChangedObj) {
        const splitArr = item.split("|");
        const fieldStr = splitArr[1];
        if (fieldStr) {
          const { field, gtField, ltField, equal, range } =
            this.queryParams.filterChangedObj;
          // 移除对象属性
          const removeProperty = (obj, property) => {
            return property && obj && obj[property]
              ? Object.fromEntries(
                  Object.entries(obj).filter((ele) => ele[0] !== property)
                )
              : {};
          };

          const newObj = {
            field: removeProperty(field, item),
            equal: removeProperty(equal, fieldStr),
            gtField: removeProperty(gtField, fieldStr),
            ltField: removeProperty(ltField, fieldStr),
            range: removeProperty(range, fieldStr),
          };
          console.log("newObj=====>", newObj);
          this.queryParams.filterChangedObj = newObj;
          const filterObj = this.dealFilterFun(newObj);
          this.queryParams.filterChangedObj.filterObj = filterObj;
        } else {
          this.queryParams.filterChangedObj = {};
        }
      } else {
        this.queryParams.filterChangedObj = {};
      }
    },

    // 获取排序结果
    sortableFun(ele) {
      console.log("获取排序结果", ele);
    },

    getDrawerContainer() {
      const ele = document.getElementById("AgGridTable-box");
      console.log("ele======>", ele);
      return ele;
    },
    // 关闭弹窗
    closeAgGridDrawer() {
      this.openAgRowDataDetailDrawer = false;
      setTimeout(() => {
        this.agRowDataDetailData = null;
      });
    },
    // 成功设置字段
    setFieldsSuccess() {
      console.log("成功设置字段", this.agTableOptions);
      const { initTable } = this.agTableOptions;
      if (initTable && typeof initTable === "function") {
        initTable();
      } else {
        this.$message.warning("初始化表格失败，请联系管理员");
      }
    },

    // 前端导出默认excel
    exportExcelFun() {
      const { agTableApi, initColumnDefs } = this.agTableOptions;

      if (agTableApi && typeof agTableApi.getSelectedRows === "function") {
        const selectedRows = agTableApi.getSelectedRows();
        if (selectedRows && selectedRows.length) {
          const exportData = {
            tHeader: [],
            filterVal: [],
            title: initColumnDefs.fieldsConfig.name,
            tableData: selectedRows,
          };

          initColumnDefs.sortabledFields.forEach((ele) => {
            if (!ele.hide) {
              exportData.tHeader.push(ele.headerName);
              exportData.filterVal.push(ele.field);
            }
          });

          const key = this.agGridId;
          this.$message.loading({ content: "前端导出中，请稍候...", key });
          EXCEL.exportExcelFun(exportData);
          this.$message.success({ content: "前端导出成功", key, duration: 2 });
        }
      }
    },

    // 后端导出excel文件流数据
    async exportExcelBlobByBackEndFun() {
      const key = this.agGridId;
      this.$message.loading({ content: "前端导出中，请稍候...", key });
      const blob = await exportExcelBolb({
        dbName: "用户表",
        filename: "用户表",
        mapping: {
          用户名称: "userName",
          用户角色: "userRole",
          性别: "sex",
          详细地址: "address",
        },
        queryParams: {
          state: 1,
        },
        isDownLoadTemplate: false,
      });
      downloadByATag(blob);
      this.$message.success({ content: "前端导出成功", key, duration: 2 });
    },

    // 前端导出csv
    exportExcelCSVFun() {
      const key = this.agGridId;
      this.$message.loading({ content: "前端导出中，请稍候...", key });
      // EXCEL.exportExcelFun(exportData);
      this.agTableOptions.agTableApi?.exportDataAsCsv();
      this.$message.success({ content: "前端导出成功", key, duration: 2 });
    },

    // 前端导出带样式excel
    exportStyleExcelFun() {
      const { agTableApi, initColumnDefs } = this.agTableOptions;

      if (agTableApi && typeof agTableApi.getSelectedRows === "function") {
        const selectedRows = agTableApi.getSelectedRows();
        if (selectedRows && selectedRows.length) {
          const exportData = {
            multiHeader: [],
            multiHeader2: [],
            filterVal: [],
            title: initColumnDefs.fieldsConfig.name,
            tableData: selectedRows,
            indexNumber: 6,
          };

          initColumnDefs.sortabledFields.forEach((ele) => {
            if (!ele.hide) {
              exportData.multiHeader2.push(ele.headerName);
              exportData.filterVal.push(ele.field);
            }
          });

          if (exportData.multiHeader2.length) {
            exportData.multiHeader = new Array(exportData.multiHeader2.length)
              .fill(undefined)
              .map((ele, ind) => ind + 1);
          }

          console.log("exportData123", exportData);
          const key = this.agGridId;
          this.$message.loading({ content: "前端导出中，请稍候...", key });
          EXCEL.exportStyleExcel(exportData);
          this.$message.success({ content: "前端导出成功", key, duration: 2 });
        }
      }
    },

    // 前端导出PDF
    exportPDFFun() {
      const { agTableApi, initColumnDefs } = this.agTableOptions;

      if (agTableApi && typeof agTableApi.getSelectedRows === "function") {
        const selectedRows = agTableApi.getSelectedRows();
        if (selectedRows && selectedRows.length) {
          const exportData = {
            tHeader: [],
            title: initColumnDefs.fieldsConfig.name,
            tableData: selectedRows,
          };

          initColumnDefs.sortabledFields.forEach((ele) => {
            if (!ele.hide) {
              exportData.tHeader.push(ele.headerName);
            }
          });

          const key = this.agGridId;
          this.$message.loading({ content: "前端导出中，请稍候...", key });
          exportPDFFile(JSON.stringify(exportData));
          this.$message.success({ content: "前端导出成功", key, duration: 2 });
        }
      }
    },

    // 前端导出Html PDF
    exportHTMLPDFFun() {
      const { initColumnDefs } = this.agTableOptions;
      const key = this.agGridId;
      const htmlEle = document.getElementById(key);

      if (htmlEle) {
        htmlPdf(initColumnDefs.fieldsConfig.name, htmlEle);
      } else {
        this.$message.warning("未获取到html");
      }
    },

    // 前端导出TXT
    exportTXTFun() {
      const { agTableApi, initColumnDefs } = this.agTableOptions;

      if (agTableApi && typeof agTableApi.getSelectedRows === "function") {
        const selectedRows = agTableApi.getSelectedRows();
        if (selectedRows && selectedRows.length) {
          const exportData = {
            tHeader: [],
            filterVal: [],
            title: initColumnDefs.fieldsConfig.name,
            tableData: selectedRows,
          };

          initColumnDefs.sortabledFields.forEach((ele) => {
            if (!ele.hide) {
              exportData.tHeader.push(ele.headerName);
              exportData.filterVal.push(ele.field);
            }
          });

          console.log("exportData123123", exportData);

          const key = this.agGridId;
          this.$message.loading({ content: "前端导出中，请稍候...", key });
          downLoadTableTxtFile(exportData);
          this.$message.success({ content: "前端导出成功", key, duration: 2 });
        }
      }
    },

    // 前端导出JSON
    exportJSONFun() {
      const { agTableApi, initColumnDefs } = this.agTableOptions;

      if (agTableApi && typeof agTableApi.getSelectedRows === "function") {
        const selectedRows = agTableApi.getSelectedRows();
        if (selectedRows && selectedRows.length) {
          const exportData = {
            title: initColumnDefs.fieldsConfig.name,
            tableData: selectedRows,
          };

          const key = this.agGridId;
          this.$message.loading({ content: "前端导出中，请稍候...", key });
          downLoadJsonFile(selectedRows, exportData.title);
          this.$message.success({ content: "前端导出成功", key, duration: 2 });
        }
      }
    },

    handleAGGridEvent(event) {
      console.log("Button 123clicked:", event); // 在 ag-Grid 的 Vue 组件外部处理事件和参数
    },
  },
};
</script>
<style lang="less" scoped>
/*搜索框条件样式*/
.tableHeaderBg {
  width: 100%;
  background-color: #fff;
  padding-left: 10px;
  padding-top: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
}

.AgGridTable-pagation {
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  &-fieldsSet,
  &-download,
  &-upload {
    margin-right: 6px;
  }
}

::v-deep .AgGridTable-pagation-com {
  .ant-pagination-item,
  .ant-pagination-item-ellipsis,
  .ant-pagination-jump-next,
  .ant-pagination-jump-prev,
  .ant-pagination-prev {
    display: none;
  }
  .ant-pagination-options {
    margin-left: 8px;
  }
}

::v-deep .my-agGrid-detail {
  padding: 0px 10px;
  font-size: 14px;
  margin-bottom: 60px;

  .ag-grid-drawer {
    display: grid;
    grid-template-columns: 1.2fr 2fr;
    column-gap: 8px;
    padding: 4px 0;
    .title {
      text-align: right;
      color: #999;
      word-break: keep-all;
    }
    .context {
      color: #333;
      word-break: break-all;
    }
  }
}

.AgGridTable {
  background-color: transparent;
}

::v-deep .AgGridTable-box {
  .ag-root-wrapper {
    border: 1px solid #e3e3e3;
  }
}

.AgGridTable-renderTable {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

// 隐藏合计行的操作按钮
.ag-pinned-right-floating-bottom {
  display: none !important;
  background-color: #fff;
}
</style>
