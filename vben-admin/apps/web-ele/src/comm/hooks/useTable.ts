import type { Table } from './interface';

import { computed, reactive, toRefs } from 'vue';
import type { Ref } from 'vue';

import { cloneDeep } from 'lodash-es';

/**
 * @description table 页面操作方法封装
 * @param {Function} api 获取表格数据 api 方法 (必传)
 * @param {object} initParam 获取数据初始化参数 (非必传，默认为{})
 * @param {boolean} isPageable 是否有分页 (非必传，默认为true)
 * @param {Function} dataCallBack 对后台返回的数据进行处理的方法 (非必传)
 */
export const useTable = (
  api: (params: any) => Promise<any>,
  initParam: object = {},
  isPageable: boolean = true,
  dataCallBack?: ((data: any) => any) | null,
  requestError?: (error: any) => void,
  tableLoading?: Ref<boolean>,
) => {
  const state = reactive<Table.StateProps>({
    // 分页数据
    pageable: {
      // 当前页数
      pageNum: 1,
      // 每页显示条数
      pageSize: 10,
      // 总条数
      total: 0,
    },
    // 初始化默认的查询参数
    searchInitParam: {},
    // 查询参数(只包括查询)
    searchParam: {},
    // 表格数据
    tableData: [],
    // 总参数(包含分页和查询参数)
    totalParam: {},
  });

  /**
   * @description 分页查询参数(只包括分页和表格字段排序,其他排序方式可自行配置)
   */
  const pageParam = computed({
    get: () => {
      return {
        pageNum: state.pageable.pageNum,
        pageSize: state.pageable.pageSize,
      };
    },
    set: (newVal: any) => {
      console.warn('我是分页更新之后的值', newVal);
    },
  });

  /**
   * @description 获取表格数据
   * @return void
   */
  const getTableList = async () => {
    if (!api) return;
    try {
      // 先把初始化参数和分页参数放到总参数里面
      Object.assign(
        state.totalParam,
        initParam,
        isPageable ? pageParam.value : {},
      );
      tableLoading && (tableLoading.value = true);
      let data = await api({
        ...state.searchInitParam,
        ...state.totalParam,
      });

      dataCallBack &&
        typeof dataCallBack === 'function' &&
        (data = dataCallBack(data));

      // 解构后台返回的分页数据 (如果有分页更新分页信息)
      if (isPageable) {
        const { pageNum, pageSize, result, total } = data;

        state.tableData = result;
        state.pageable.total = total;
        state.pageable.pageSize = pageSize;
        state.pageable.pageNum = pageNum;
      } else {
        state.tableData = data?.data || [];
      }
    } catch (error) {
      console.error('请求出错=====>', error);
      requestError && typeof requestError === 'function' && requestError(error);
    } finally {
      tableLoading && (tableLoading.value = false);
    }
  };

  /**
   * @description 更新查询参数
   * @return void
   */
  const updatedTotalParam = () => {
    state.totalParam = {};
    // 处理查询参数，可以给查询参数加自定义前缀操作
    const nowSearchParam: Table.StateProps['searchParam'] = {};

    // 防止手动清空输入框携带参数（这里可以自定义查询参数前缀）
    for (const key in state.searchParam) {
      // 某些情况下参数为 false/0 也应该携带参数
      if (
        state.searchParam[key] ||
        state.searchParam[key] === false ||
        state.searchParam[key] === null ||
        state.searchParam[key] === 0
      ) {
        nowSearchParam[key] = state.searchParam[key];
      }
    }
    const nSearchParam = cloneDeep(nowSearchParam);
    console.log('nSearchParam123123123', nSearchParam);
    console.log('state.totalParam', state.totalParam);
    Object.assign(state.totalParam, nowSearchParam);
  };

  /**
   * @description 表格数据查询
   * @return void
   */
  const search = () => {
    state.pageable.pageNum = 1;
    updatedTotalParam();
    getTableList();
  };

  /**
   * @description 表格数据重置
   * @return void
   */
  const reset = () => {
    state.pageable.pageNum = 1;
    // 重置搜索表单的时，如果有默认搜索参数，则重置默认的搜索参数
    state.searchParam = { ...state.searchInitParam };
    updatedTotalParam();
    getTableList();
  };

  /**
   * @description 每页条数改变
   * @param {number} val 当前条数
   * @return void
   */
  const handleSizeChange = (val: number) => {
    state.pageable.pageNum = 1;
    state.pageable.pageSize = val;
    getTableList();
  };

  /**
   * @description 当前页改变
   * @param {number} val 当前页
   * @return void
   */
  const handleCurrentChange = (val: number) => {
    state.pageable.pageNum = val;
    getTableList();
  };

  return {
    ...toRefs(state),
    getTableList,
    handleCurrentChange,
    handleSizeChange,
    reset,
    search,
    updatedTotalParam,
  };
};
