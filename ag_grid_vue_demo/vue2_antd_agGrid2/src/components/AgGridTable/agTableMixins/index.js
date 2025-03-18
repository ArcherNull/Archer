/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-01-29 15:22:57
 * @LastEditTime: 2024-07-20 23:47:32
 * @Description: 用于应用二次封装的组件的混入
 */
import { before, cloneDeep, isArray, isEmpty, isObject } from "lodash";
import { AgGridUtils, InitColumnDefs } from "../common/agGrid-utils";
import { getRandom6DigitNumber } from "../common/utils/index";

const AgGridTableMixins = {
  data() {
    return {
      // 获取点击的行数据，用于表格的编辑和删除
      editRowData: null,
      // 当前选中的行数据，用于展示批量操作
      rowSelectedList: null,
      // 6位随机数
      random6DigitNumber: getRandom6DigitNumber(),
      // ag-grid表格整体配置项-- 用户自定义配置型
      gridOptions: {
        rowHeight: 36, // 行高，默认36
      },
      agTableOptions: {
        // 主题可设置值为： alpine / balham / material
        theme: "alpine",
        // 表格样式style
        style: null,
        // 表格实例化后的自定义api
        agTableApi: null,
        // 初始化表格方法，可用于重新刷新表格
        initTable: null,
        // 初始化列头实例
        initColumnDefs: null,
        // 列头设置，先有列头，再有行数据，如果有行数据的情况下，更改其引用，并不满足ag-grid-vue的要求会导致报错
        columnDefs: [],
        // 表格行数据
        rowData: [],
        // 自定义配置gridOptions，该属性为方法
        gridOptions: null,
        // 自定义默认列配置，该属性为方法
        defaultColDef: null,
      },
      agQueryParams: {
        // 是否初始化表格成功状态，true表示成功，false表示失败；v-if控制
        initTableSuccess: true,
        // 表格接口请求loading,true表示请求中，false表示请求成功
        getDataLoading: true,
        // 总页数，用于封装好的分页组件
        totalPages: 0,
        // 总条数，用于封装好的分页组件
        total: 0,
        // 当前页数，用于封装好的分页组件
        pageNum: 1,
        // 当前条数，用于封装好的分页组件
        pageSize: 100,
        // 列头筛选数据收集对象，暂时不使用
        filterChangedObj: {},
        // BLHeaderSearch组件头部请求参数对象
        queryParam: {},
        // BLHeaderSearch组件展开/收起切换
        toggleSearchStatus: false,
      },
    };
  },
  computed: {
    eventName() {
      const { initColumnDefs } = this.agTableOptions;
      if (initColumnDefs && initColumnDefs.agGridTableId) {
        return initColumnDefs.agGridTableId;
      } else {
        return undefined;
      }
    },
  },
  watch: {
    eventName(newVal) {
      if (newVal) {
        const that = this;
        AgGridUtils.setEventBusListener(newVal, (params) => {
          that.agTableRowOperation(params);
        });
      }
    },
  },
  beforeDestory() {
    // 销毁事件总线，防止多次触发。
    this.eventName && AgGridUtils.removeEventBusListener(this.eventName);
    this.agTableOptions.agTableApi.gridApi.destroy();

    this.agQueryParams.getDataLoading = true;
    this.agTableOptions.style = null
    this.agTableOptions.agTableApi = null
    this.agTableOptions.initTable = null
    this.agTableOptions.initColumnDefs = null
    this.agTableOptions.defaultColDef = null
    this.agTableOptions.gridOptions = null
    this.agTableOptions.rowData = null

    this.rowSelectedList = null
    this.agQueryParams.filterChangedObj = {}
    this.agQueryParams.queryParam = {}

  },
  created() {
    if (!this.fieldsConfig) {
      console.error("ag-grid参数[fieldsConfig]是必填项");
      return false;
    }
    if (this.fieldsConfig.isDefaultDealQueryParamObj !== false) {
      this.dealQueryParamObj();
    }
    if (this.fieldsConfig.isDefaultInitAgGridTable !== false) {
      this.initTable();
    }
  },
  methods: {
    // 获取表格自定义gridOptions【示例方法】
    getCustmoerGridOptions() {
      const gridOptions = {
        rowHeight: 80,
        headerHeight: 60,
        rowSelection: "single",
        rowStyle: { backgroundColor: "#D3D3D3" },
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

    // 获取列的默认设置defaultColDef【示例方法】
    getCustomerDefaultColDef() {
      return {
        cellStyle: function (params) {
          if (params.node.rowPinned === "bottom") {
            return { color: "#333", "line-height": "36px", height: "36px" }; // 列的单元格默认样式
          } else {
            return { color: "#ff0", "line-height": "80px" }; // 列的单元格默认样式
          }
        },
      };
    },

    // 通过headerSearchConfig拼装agQueryParams.queryParam的属性
    dealQueryParamObj() {
      if (this.headerSearchConfig) {
        const { main, more } = this.headerSearchConfig;
        if (isArray(main) && main.length) {
          const obj = {};
          var searchList = [...main];
          if (isArray(more) && more.length) {
            searchList = [...main, ...more];
          }
          searchList.forEach((ele) => {
            const {
              field,
              type,
              defaultValue,
              selectDefaultValue,
              selectField,
            } = ele;

            if (type === "region") {
              obj[field] = defaultValue || [];
            } else {
              if (field) {
                obj[field] = defaultValue;
              }
              if (selectField) {
                obj[selectField] = selectDefaultValue;
              }
            }
          });

          console.log("obj=====>", obj);

          this.$set(this.agQueryParams, "queryParam", obj);
          // 是否更改了查询条件
          this.$set(this.agQueryParams, "isChangeQueryCondition", false);
          // 通过搜索头执行的搜索次数
          this.$set(this.agQueryParams, "searchRequestCount", 0);
          // 存储第一次的最原始查询数据，用于重置回显
          this.$set(this.agQueryParams, "resetQueryParams", cloneDeep(obj));
        }
      }
    },

    // 重置
    searchReset() {
      console.log("查询=====12");
      const { queryParam, resetQueryParams } = this.agQueryParams;
      this.agQueryParams.searchRequestCount = 0;
      this.agQueryParams = Object.assign(this.agQueryParams, {
        initTableSuccess: true,
        getDataLoading: false,
        totalPages: 0,
        total: 0,
        pageNum: 1,
        pageSize: 100,
        filterChangedObj: {},
        queryParam: Object.assign(queryParam, resetQueryParams || {}),
        toggleSearchStatus: false,
      });
      this.geAjaxList();
    },

    // 请求下一页
    requestNextPage(pageNum) {
      console.log("请求下一页");
      if (this.agQueryParams.totalPages > this.agQueryParams.pageNum) {
        if (pageNum) {
          this.agQueryParams.pageNum = pageNum;
        } else {
          this.agQueryParams.pageNum++;
        }
        this.geAjaxList(this.agQueryParams.queryParam);
      }
    },

    // 获取多选的行数据
    rowSelected(ele) {
      console.log("获取多选的行数据", ele);
      const selectedRowData =
        this.agTableOptions.agTableApi.getSelectedRows(false);
      console.log("获取多选的行数据123", selectedRowData);
      this.rowSelectedList = selectedRowData || [];
    },

    // 获取点击的行数据，用于表格的编辑和删除
    getRowData(ele) {
      this.editRowData = ele;
    },
    // 获取表格ag-grid的api
    getGridApi(ele) {
      const agTableApi = new AgGridUtils(ele, this.fieldsConfig);
      console.log("agTableApi======>", agTableApi);
      this.agTableOptions.agTableApi = agTableApi;
    },

    // 初始化表格, type  default表示默认 , customer 表示自定义请求
    async initTable() {
      try {
        const { style } = this.fieldsConfig;
        this.agQueryParams.initTableSuccess = false;
        this.agQueryParams.pageNum = 1;
        const initColumnDefs = new InitColumnDefs();
        const currentFields = await initColumnDefs.judgeReadServerFieldsData(
          this.fieldsConfig
        );

        this.agTableOptions.columnDefs = currentFields;
        this.agTableOptions.initColumnDefs = initColumnDefs;

        if (!this.agTableOptions.initTable) {
          this.agTableOptions.initTable = this.initTable;
        }

        if (style && isObject(style) && !isEmpty(style)) {
          this.agTableOptions.style = style;
        }

        this.agQueryParams.initTableSuccess = true;

        this.geAjaxList();
      } catch (err) {
        console.error("err=====>", err);
        this.$message.error(err?.message || "初始化表格函数[initTable]报错");
      }
    },

    geAjaxList(params = {}) {
      if (this.getList && typeof this.getList === "function") {
        this.getList(params);
      } else {
        if (this.fieldsConfig.isDefaultInitAgGridTable !== false) {
          // 自定义方法名称
          console.error(
            "getList查询接口方法是必要方法，请检查父组件是否有填写"
          );
        } else {
          console.error(
            "fieldsConfig对象中的[isDefaultInitAgGridTable]属性已经设置为false,请在父组件中methods编写[geAjaxList]方法替代混入的[geAjaxList]方法"
          );
        }
      }
    },
  },
};

export default AgGridTableMixins;
