<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-04-03 11:57:04
 * @LastEditTime: 2024-07-22 01:00:23
 * @Description: 忘记密码
-->
<template>
  <BLModal
    class="ChildDictDialog"
    title="设置字典项"
    :visible="visible"
    :okButtonProps="{ htmlType: 'submit' }"
    :confirmLoading="submitLoading"
    width="80%"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <div class="ChildDictDialog-header">
      <BLHeaderBtn
        :row-selected-list="rowSelectedList"
        :btn-config-list="btnConfigList"
        @headerBtnOperation="headerBtnOperation"
      />
    </div>

    <AgGridTable
      :ag-table-options="agTableOptions"
      :ag-table-switch="{
        isScrollEndRequest: true,
        isShowExcelDownload: true,
        drawerDoubleShow: false,
      }"
      :query-params="agQueryParams"
      @getRowData="getRowData"
      @getGridApi="getGridApi"
      @rowSelected="rowSelected"
      @requestNextPage="requestNextPage"
    />

    <!-- 新增/编辑字典 -->
    <AddDictDialog
      :visible.sync="oprnAddDictDialog"
      :bindId="rowInfo && rowInfo.id ? rowInfo.id : ''"
      :rowInfo="selectedRowInfo"
      @success="getList"
    >
    </AddDictDialog>
  </BLModal>
</template>

<script>
import AgGridTableMixins from "@/components/AgGridTable/agTableMixins/index";
import { getDictList, batchDelDict, batchEditdDicState } from "@/api/index.js";
import AgRowActionChildBtn from "./AgRowActionChildBtn.vue";
import AddDictDialog from "./AddDictDialog.vue";

export default {
  name: "ChildDictDialog",
  mixins: [AgGridTableMixins],
  components: {
    AgRowActionChildBtn,
    AddDictDialog,
  },
  props: {
    // 弹窗显示隐藏
    visible: {
      type: Boolean,
      default: false,
    },
    // 行数据
    rowInfo: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      // 提交loading
      submitLoading: false,

      oprnAddDictDialog: false,

      // 头部操作按钮列表配置
      btnConfigList: [
        {
          btnText: "新增",
          type: "primary",
          power: "getTransportNode",
        },
      ],

      selectedRowInfo: null,

      // ag-grid表格字段配置
      fieldsConfig: {
        name: "字典项设置",
        // 页面中如果有多表，需要字段设置用
        id: "childDictManage",
        isDefaultInitAgGridTable: false,
        style: {
          height: "450px",
        },
        // 表头
        database: {
          字典ID: "id",
          字典label: "dicLabel",
          字典value: "dicValue",
          额外参数: "dicExtraParams",
          备注: "dicRemark",
          状态: "dicState",
          创建人: "createBy",
          创建时间: "createdAt",
          更新时间: "updatedAt",
        },
        specColumns: [
          {
            headerName: "状态",
            field: "dicState",
            cellRenderer: (params) => {
              if (params.node.rowPinned === "bottom") return;
              return params.value == 1 ? "开启" : "禁用";
            },
          },
        ],
        actionColumns: [
          {
            headerName: "操作",
            field: "agTableAction",
            width: 170,
            cellRendererFramework: "AgRowActionChildBtn",
          },
        ],
      },
    };
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        this.initModal();
      }
    },
  },
  methods: {
    initModal() {
      console.log("弹窗初始化", this.rowInfo);
      this.initTable();
    },

    getList() {
      const dicBindId = this.rowInfo?.id;
      if (dicBindId) {
        const { pageSize, pageNum } = this.agQueryParams;
        if (pageNum === 1) {
          this.agTableOptions.rowData = null;
        }
        this.agQueryParams.getDataLoading = true;
        this.rowSelectedList = null;
        getDictList({
          pageSize,
          pageNum,
          queryParams: {
            dicBindId,
          },
        })
          .then((res) => {
            if (res?.code === 200) {
              const { data: rows, total = 0, pages } = res;
              this.agQueryParams.total = total;
              this.agQueryParams.totalPages = pages;

              if (pageNum <= 1) {
                this.agTableOptions.rowData = rows;
              } else {
                // 此方式会导致滚动条回到初始位置
                this.agTableOptions.rowData = {
                  ...this.agTableOptions.rowData,
                  ...rows,
                };
              }
            } else {
              this.$message.error(res.message || "查询列表失败");
            }
          })
          .finally(() => {
            this.agQueryParams.getDataLoading = false;
          });
      }
    },

    // 头部按钮操作
    headerBtnOperation(item) {
      console.log("头部按钮操作", item);
      const { btnText } = item;
      switch (btnText) {
        case "新增":
          console.log("新增");
          this.selectedRowInfo = null;
          this.oprnAddDictDialog = true;
          break;
      }
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
          this.oprnAddDictDialog = true;
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
    toggleStatus(rowList, dicState) {
      console.log("启用/禁用", rowList);
      console.log("启用/dicState", dicState);
      if (rowList?.length) {
        const that = this;
        const ids = rowList.map((ele) => ele.id).join(",");
        const actionText = dicState === 0 ? "禁用" : "启用";
        this.$confirm({
          title: "温馨提示",
          content: `您确认${actionText}吗`,
          onOk: async function () {
            console.log("提交");
            const res = await batchEditdDicState({
              ids,
              dicState,
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
      console.log("ids123123", ids);
      const that = this;
      this.$confirm({
        title: "操作确认",
        content: `删除后无法恢复，您是否确认删除?`,
        onOk: async function () {
          console.log("提交");
          const res = await batchDelDict({
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

    // 取消
    handleCancel() {
      this.$emit("update:visible", false);
    },
    // 提交表单
    handleSubmit() {
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log("提交表单");
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
.ChildDictDialog {
  &-header {
    margin-bottom: 10px;
  }
}
</style>
