<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-24 14:29:31
 * @LastEditTime: 2024-07-24 00:16:59
 * @Description: 
-->
<template>
  <div class="OrderManage">
    <div class="OrderManage-header">
      <!-- 查询区域 -->
      <div class="OrderManage-header-query">
        <BLHeaderSearch
          :header-search-config="headerSearchConfig"
          :ag-query-params="agQueryParams"
          ref="BLHeaderSearch"
          :get-list="getList"
          :search-reset="searchReset"
        />
      </div>

      <!-- 操作按钮区域 -->
      <div class="OrderManage-header-btn">
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
        drawerDoubleShow: true,
        
        isShowExportExcelXlsxBtn: true,
        isShowExportExcelCsvFile: true,
        isShowExportExcelStyleXlsxFile: true,
        isShowExportPdfFile: true,
        isShowExportHtmlPdfFile: true,
        isShowExportTextFile: true,
        isShowExportJsonFile: true,
        isShowExcelUpload: true,
      }"
      :query-params="agQueryParams"
      @getRowData="getRowData"
      @getGridApi="getGridApi"
      @rowSelected="rowSelected"
      @requestNextPage="requestNextPage"
    />

    <div class="webWorker">
      <div class="webWorker-text">
        {{ webWorkerText }}
      </div>
      <div class="webWorker-btn">
        <BLButton @click="killWebWorker()">杀死进程</BLButton>

        <BLButton>暂停进程</BLButton>
      </div>
    </div>
  </div>
</template>

<script>
import { getOrderList, batchDelOrder } from "@/api/index.js";
import AgGridTableMixins from "@/components/AgGridTable/agTableMixins/index";
import AgRowActionBtn from "./components/AgRowActionBtn/index.vue";
import * as storage from "@/utils/storage";
import { saveAs } from "file-saver";
import { CustomerRequestWorker } from "@/components/AgGridTable/common/Worker/customerRequestWorker.js";

// import workerJs from '../../../../components/AgGridTable/common/Worker/orderWorker.worker.js'

export default {
  name: "OrderManage",
  mixins: [AgGridTableMixins],
  components: {
    // eslint-disable-next-line vue/no-unused-components
    AgRowActionBtn,
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
            selectDefaultValue: "orderNo",
            options: [
              {
                label: "订单号",
                value: "orderNo",
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
        ],
      },

      // 头部操作按钮列表配置
      btnConfigList: [
        {
          btnText: "批量请求[classic]",
          type: "primary",
          power: "getTransportNode",
        },
        {
          btnText: "批量请求[module]",
          type: "primary",
          power: "getTransportNode",
        },
        {
          btnText: "操作",
          type: "primary",
          power: "getTransportNode",
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
          ],
        },
      ],

      // ag-grid表格字段配置
      fieldsConfig: {
        name: "订单管理",
        // 页面中如果有多表，需要字段设置用
        id: "OrderManage",
        // 表头
        database: {
          订单号: "orderNo",
          托运单单号: "noteNo",
          客户单号: "customerNo",
          来源单号: "sourceNo",
          订单时间: "orderDate",
          分段数量: "orderSplitCount",
          订单状态: "orderState",
          财务审核状态: "financeAuditState",
          对账状态: "billState",
          核销状态: "verifyoffState",
          跟踪状态: "trackState",
          是否干线出库: "isMiddle",
          是否对接: "isJoin",
          对接公司: "joinCompanyName",
          对接项目部名称: "joinProdivisionName",
          是否系统内组织: "isSystemInside",
          货物性质: "goodsNature",
          订单件数: "orderNum",
          订单重量: "orderWeight",
          订单体积: "orderVolume",
          计费重量: "calculationWeight",
          计费体积: "calculationVolume",
          干线单价: "calculationPrice1",
          干线单价2: "calculationPrice2",
          提货单价: "deliveryPrice1",
          提货单价2: "deliveryPrice2",
          送货单价: "sendPrice1",
          送货单价2: "sendPrice2",
          计算方式: "calculateMode",
          阶梯类型: "ladderType",
          增减费合计: "addCutFee",
          产品类型: "productType",
          运输类型: "transitType",
          发站: "beginSite",
          到站: "endSite",
          发货人: "beginMan",
          发货公司: "beginCompany",
          发货人电话: "beginPhone",
          始发省: "beginProvince",
          始发市: "beginCity",
          始发区: "beginArea",
          始发街道: "beginStreet",
          发货详细地址: "beginAddress",
          收货人: "endMan",
          收货公司: "endCompany",
          收货人电话: "endPhone",
          目的省: "endProvince",
          目的市: "endCity",
          目的区: "endArea",
          目的街道: "endStreet",
          收货详细地址: "endAddress",
          交接方式: "handoverMode",
          现付: "nowPay",
          现付对账剩余金额: "surplusNowPay",
          提付: "fetchPay",
          提付对账剩余金额: "surplusFetchPay",
          月结: "monthPay",
          月结对账剩余金额: "surplusMonthPay",
          回单付: "receiptPay",
          送货费: "terminalFee",
          提货费: "deliveryFee",
          已核销金额: "verifyoffMoney",
          支付方式: "paymentMode",
          客户名称: "customerName",
          客户公司: "customerCompany",
          服务方式: "serviceFormula",
          增值服务费合计: "otherFee",
          基本运费: "basicFee",
          总运费: "totalFee",
          总收入合计: "totalIn",
          计费方式: "calculateStandardName",
          车型: "carType",
          车长: "carLength",
          是否回单: "isReceipt",
          回单份数: "receiptNum",
          回单要求: "receiptRequirement",
          成本分摊: "costShare",
          "成本率(%)": "costRate",
          提货成本分摊: "deliveryCost",
          干线成本分摊: "trunklineCost",
          整车成本分摊: "vehicleCost",
          送货成本分摊: "terminalCost",
          作废人: "cancelMan",
          作废时间: "cancelDate",
          订单审核人: "orderAuditMan",
          订单审核时间: "orderAuditDate",
          声明价值: "declaredValue",
          付款人: "payMan",
          项目部: "prodivisionName",
          业务员: "salesMan",
          业务员电话: "salesManPhone",
          业务所属部门: "salesDept",
          服务类型: "taxType",
          干线运费: "trunklineFee",
          "税率/干线运费税率": "taxRate",
          订单不含税金额: "notTaxMoney",
          不含税干线运费: "trunkLineFeeNoTax",
          物流辅助费: "assistFee",
          物流辅助费税率: "assistFeeRate",
          不含税物流辅助费: "assistFeeNoTax",
          物流辅助费对账剩余金额: "surplusAssistFee",
          货运代理费: "agencyFee",
          货运代理费税率: "agencyFeeRate",
          不含税货运代理费: "agencyFeeNoTax",
          货运代理费对账剩余金额: "surplusAgencyFee",
          销项税金: "realTax",
          服务费成本分摊: "serviceCost",
          货物名称: "goodsNameOne",
          开单人: "createdBy",
          开单时间: "createdTime",
          修改人: "updatedBy",
          修改时间: "updatedTime",
          要求提货时间: "deliveryDate",
          要求到达时间: "arriveDate",
          合同主体: "invoiceMain",
          订单备注: "orderRemark",
          操作来源: "operationType",
        },
        specColumns: [],
        actionColumns: [
          {
            headerName: "操作",
            field: "agTableAction",
            width: 80,
            cellRendererFramework: "AgRowActionBtn",
          },
        ],
      },

      // web worker 提示语
      webWorkerText: "提示语",

      // web worker进程
      myWorker: null,

      tmyWorker: null,
    };
  },

  methods: {
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
      getOrderList({
        pageSize,
        pageNum,
        ...(params || {}),
        ...(filterChangedObj.filterObj || {}),
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
            }
          } else {
            this.$message.error(res.message || "查询列表失败");
          }
        })
        .finally(() => {
          this.agQueryParams.getDataLoading = false;
        });
    },

    // 删除
    deleteConfirm(ids) {
      const that = this;
      that.$confirm({
        title: "操作确认",
        content: `删除后无法恢复，您是否确认删除?`,
        onOk: async function () {
          console.log("提交");
          const res = await batchDelOrder({
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
      switch (btnText) {
        case "批量请求[classic]":
          console.log("批量请求[classic]");
          this.rushDoBatchRequest();
          break;
        case "批量请求[module]":
          console.log("批量请求[module]");
          this.rushDoBatchRequest1();
          break;
        case "操作":
          console.log("操作", this.agQueryParams);
          break;
        case "删除":
          console.log("删除");
          break;
        case "批量操作-删除":
          console.log("批量操作-删除");
          this.batchDelData(this.rowSelectedList);
          break;
      }
    },

    // 表格行数据操作方法
    agTableRowOperation(item) {
      const { params, btnText } = item;
      const rowInfo = params.data;
      this.selectedRowInfo = rowInfo;
      switch (btnText) {
        case "删除":
          console.log("删除");
          this.deleteConfirm(rowInfo.id);
          break;
      }
    },

    // 获取排序字段
    getSortabledFields() {
      const sortabledFields =
        this.agTableOptions.initColumnDefs.sortabledFields;

      console.log("sortabledFields", sortabledFields);
      let tHeader = [];
      let filterVal = [];
      sortabledFields.forEach((ele) => {
        if (!ele.hide) {
          tHeader.push(ele.headerName);
          filterVal.push(ele.field);
        }
      });
      return {
        tHeader,
        filterVal,
      };
    },

    getWorkerOptions() {
      const that = this;
      const { pageNum, pageSize, total } = this.agQueryParams;
      const rPageSize = pageSize;
      const totalPage = Math.ceil(
        (total - (pageNum - 1) * pageSize) / rPageSize
      );
      console.log("totalPage", totalPage);
      const Authorization = storage.getStorage("token");

      const options = {
        pageOptions: {
          // 请求参数
          requestParams: {
            url: "/api/order/list",
            method: "post",
            data: {
              pageNum,
              pageSize: rPageSize,
            },
            headers: {
              Authorization: `Bearer ${Authorization}`,
            },
          },
          // 界面参数
          pageParams: {
            total,
            totalPage,
          },
          // 表格排序字段
          sortabledFields: that.agTableOptions.initColumnDefs.sortabledFields,
        },

        requestOptions: {
          maxNum: 2,
          responseType: "file",
        },
        exportFileOptions: {
          fileType: "excel",
          fileName: "订单管理",
        },
      };

      return options;
    },

    // 执行批量请求
    rushDoBatchRequest() {
      console.log("执行批量请求");
      const that = this;
      if (window.Worker) {
        if (this.tmyWorker) {
          this.tmyWorker?.terminate();
        }

        // 创建Web Worker实例
        const tmyWorker = new Worker(
          new URL("./testW.worker.js", import.meta.url)
        );

        this.tmyWorker = tmyWorker;

        // 监听来自Worker的消息
        tmyWorker.onmessage = function (ele) {
          const result = ele.data;
          console.log("请求获取到参数", result);
          const { message, postResult, status } = result;
          that.webWorkerText = message;
          console.log("postResult123123", postResult);

          const saveExcelFile = (wbout) => {
            saveAs(
              new Blob([wbout], {
                type: "application/octet-stream",
              }),
              "test.xlsx"
            );
          };

          switch (status) {
            case "processing":
              console.log("processing");
              break;
            case "success":
              console.log("success");
              saveExcelFile(postResult);
              break;
          }
        };
        const { pageNum, pageSize, total } = this.agQueryParams;
        const rPageSize = pageSize;
        const totalPage = Math.ceil((total - pageNum * pageSize) / rPageSize);
        const Authorization = storage.getStorage("token");
        // 向Worker发送消息（即两个数字）
        tmyWorker.postMessage({
          // 请求参数
          requestParams: {
            url: "/api/order/list",
            method: "post",
            data: {
              pageNum,
              pageSize: rPageSize,
            },
            headers: {
              Authorization: `Bearer ${Authorization}`,
            },
          },
          // 界面参数
          pageParams: {
            total,
            totalPage,
          },
          // 表格排序字段
          sortabledFields: that.agTableOptions.initColumnDefs.sortabledFields,
        });
      } else {
        console.log("Your browser does not support Web Workers.");
      }
    },

    // 执行批量请求
    rushDoBatchRequest1() {
      console.log("执行批量请求");
      const that = this;
      if (window.Worker) {
        console.log("import.meta.url", import.meta.url);
        // 创建Web Worker实例
        const myWorker = new Worker(
          new URL(
            // "@/components/AgGridTable/common/Worker/orderWorker.worker.js",
            "@/components/AgGridTable/common/Worker/orderWorker.worker.js",
            import.meta.url
          )
        );

        const url = new URL(
          "@/components/AgGridTable/common/Worker/orderWorker.worker.js",
          import.meta.url
        );
        console.log("url123123", url);

        const options = this.getWorkerOptions();

        console.log("options123123123", options);

        const cWorker = new CustomerRequestWorker(
          {
            myWorker,
            ...options,
          },
          (res) => {
            console.log("父界面获取参数=====>", res);
            that.webWorkerText = res;
          }
        );

        console.log("cWorker", cWorker);
        this.myWorker = cWorker;
      } else {
        console.log("Your browser does not support Web Workers.");
      }
    },

    killWebWorker() {
      this.myWorker?.closeWorker();
    },
  },
};
</script>

<style lang="less" scoped>
.OrderManage {
  &-header {
    background-color: #fff;
    padding: 10px;
    margin-bottom: 10px;
  }
}

.webWorker {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  &-text {
    color: red;
  }
  &-btn {
    margin-left: 20px;
    display: flex;
    gap: 10px;
  }
}
</style>
