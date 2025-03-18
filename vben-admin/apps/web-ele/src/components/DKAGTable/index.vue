<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-12-27 19:32:42
 * @LastEditTime: 2025-01-03 14:30:48
 * @Description: 
-->
<script setup lang="ts" name="ProTable">
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';

import type { BreakPoint } from '#/components/Grid/interface';
import type {
  ColumnProps,
  // FileConfigType,
} from '#/components/ProTable/interface';

import {
  computed,
  defineEmits,
  defineExpose,
  defineOptions,
  defineProps,
  provide,
  reactive,
  ref,
  shallowRef,
  toRaw,
  unref,
  useAttrs,
  useSlots,
  watch,
  withDefaults,
} from 'vue';

import {
  Download,
  Operation,
  Refresh,
  Search,
  Upload,
} from '@element-plus/icons-vue';
import { throttle } from 'lodash-es';

import { useSelection } from '#/comm/hooks/useSelection';
import { useTable } from '#/comm/hooks/useTable';
import { generateUUID, handleProp } from '#/comm/utils/index';
import DKAgGrid from '#/components/DKAgGrid/index.vue';
import DKButton from '#/components/DKButton/index.vue';
import ColSetting from '#/components/ProTable/components/ColSetting.vue';
import ExportDrawer from '#/components/ProTable/components/ExportDrawer.vue';
import ImportDrawer from '#/components/ProTable/components/ImportDrawer.vue';
import Pagination from '#/components/ProTable/components/Pagination.vue';
import SearchForm from '#/components/SearchForm/index.vue';

import { getColumnDefs } from './comm';

type FileConfigType = {
  exportParam?: Function | null; // 参数
  fileType?: string; // 模块文件id|导出文件类型
  importFileType?: string; // 导入文件类型
  template?: string; // 导入模板下载
};

export interface ProTableProps {
  columnDefs?: ColDef[]; // 列配置项  ===>
  columns?: any[]; // 列配置项  ===> 必传
  data?: any[] | null; // 静态 table data 数据，若存在则不会使用 requestApi 返回的 data ===> 非必传
  requestApi?: (params: any) => Promise<any>; // 请求表格数据的 api ===> 非必传
  requestAuto?: boolean; // 是否自动执行请求 api ===> 非必传（默认为true）
  requestError?: (params: any) => void; // 表格 api 请求错误监听 ===> 非必传
  dataCallback?: ((data: any) => any) | null; // 返回数据的回调函数，可以对数据进行处理 ===> 非必传
  title?: string; // 表格标题 ===> 非必传
  pagination?: boolean; // 是否需要分页组件 ===> 非必传（默认为true）
  initParam?: any; // 初始化请求参数 ===> 非必传（默认为{}）
  border?: boolean; // 是否带有纵向边框 ===> 非必传（默认为true）
  toolButton?:
    | ('export' | 'import' | 'refresh' | 'search' | 'setting')[]
    | boolean; // 是否显示表格功能按钮 ===> 非必传（默认为true）
  rowKey?: string; // 行数据的 Key，用来优化 Table 的渲染，当表格数据多选时，所指定的 id ===> 非必传（默认为 id）
  searchCol?: number | Record<BreakPoint, number>; // 表格搜索项 每列占比配置 ===> 非必传 { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }
  isCard?: boolean; // 是否是表格样式
  isScroll?: boolean; // 是否表格滚动
  fileConfig?: FileConfigType | null; // 导入导出文件配置
  power?: string | undefined; // 权限标识码，如果是主界面就不需要，如果是主界面中其他的表格
}

defineOptions({
  // 是否使得组件自动地继承 attribute
  inheritAttrs: false,
});
// 接受父组件参数，配置默认值
const props = withDefaults(defineProps<ProTableProps>(), {
  border: true,
  columnDefs: () => [],
  columns: () => [],
  data: null,
  dataCallback: null,
  fileConfig: null,
  initParam: {},
  isCard: true,
  isScroll: false,
  pagination: true,
  power: undefined,
  requestApi: () => new Promise((resolve) => resolve([])),
  requestAuto: true,
  requestError: () => '',
  rowKey: 'id',
  searchCol: () => ({ lg: 4, md: 3, sm: 2, xl: 6, xs: 1 }),
  title: '表格',
  toolButton: true,
});

// 定义 emit 事件
const emit = defineEmits<{
  reset: [];
  rowSelected: any;
  search: [];
}>();

const slots = useSlots();
const attrs = useAttrs();

const nColumnDefs = computed(() => {
  return getColumnDefs(props, slots.operation);
});

// 表格多选 Hooks
const { isSelected, selectedList, selectedListIds, selectionChange } =
  useSelection(props.rowKey);

// 是否显示搜索模块
const isShowSearch = ref(true);

// 生成组件唯一id
const uuid = ref(`id-${generateUUID()}`);

// 表格loading
const tableLoading = ref<boolean>(false);

// column 列类型
const columnTypes = new Set(['expand', 'index', 'radio', 'selection', 'sort']);

// 获取动态powerKey
const getPowerKey = (key?: string) => {
  const powerArr = [props.power, key].filter(Boolean);
  return powerArr.join(':');
};

// 控制 ToolButton 显示
const showToolButton = (
  key: 'export' | 'import' | 'refresh' | 'search' | 'setting',
) => {
  return Array.isArray(props.toolButton)
    ? props.toolButton.includes(key)
    : props.toolButton;
};

// 表格操作 Hooks
const {
  getTableList,
  handleCurrentChange,
  handleSizeChange,
  pageable,
  reset,
  search,
  searchInitParam,
  searchParam,
  tableData,
} = useTable(
  props.requestApi,
  props.initParam,
  props.pagination,
  props.dataCallback,
  props.requestError,
  tableLoading,
);

// 监听页面 initParam 改化，重新获取表格数据
watch(() => props.initParam, getTableList, { deep: true });

// 处理表格数据
const processTableData = computed(() => {
  if (!props.data) return tableData.value;
  if (!props.pagination) return props.data;
  return props.data.slice(
    (pageable.value.pageNum - 1) * pageable.value.pageSize,
    pageable.value.pageSize * pageable.value.pageNum,
  );
});

const showImportDrawerButton = computed(() => {
  return (
    props.toolButton &&
    props.fileConfig &&
    props.fileConfig.template &&
    props.fileConfig.importFileType
  );
});

const showExportDrawerButton = computed(() => {
  return props.toolButton && props.fileConfig && props.fileConfig.fileType;
});

// 定义 enumMap 存储 enum 值（避免异步请求无法格式化单元格内容 || 无法填充搜索下拉选择）
const enumMap = ref(new Map<string, { [key: string]: any }[]>());
const setEnumMap = async ({ enum: enumValue, prop }: ColumnProps) => {
  if (!enumValue) return;

  // 如果当前 enumMap 存在相同的值 return
  if (
    enumMap.value.has(prop!) &&
    (typeof enumValue === 'function' || enumMap.value.get(prop!) === enumValue)
  )
    return;

  // 当前 enum 为静态数据，则直接存储到 enumMap
  if (typeof enumValue !== 'function')
    return enumMap.value.set(prop!, unref(enumValue!));

  // 为了防止接口执行慢，而存储慢，导致重复请求，所以预先存储为[]，接口返回后再二次存储
  enumMap.value.set(prop!, []);

  // 当前 enum 为后台数据需要请求数据，则调用该请求接口，并存储到 enumMap
  const { data } = await enumValue();
  enumMap.value.set(prop!, data);
};

// 扁平化 columns 的方法
function flatColumnsFunc(columns: ColumnProps[], flatArr: ColumnProps[] = []) {
  columns.forEach(async (col) => {
    if (col._children?.length) flatArr.push(...flatColumnsFunc(col._children));
    flatArr.push(col);

    // column 添加默认 isShow && isSetting && isFilterEnum 属性值
    col.isShow = col.isShow ?? true;
    col.isSetting = col.isSetting ?? true;
    col.isFilterEnum = col.isFilterEnum ?? true;

    // 设置 enumMap
    await setEnumMap(col);
  });
  return flatArr.filter((item) => !item._children?.length);
}

// 接收 columns 并设置为响应式
const tableColumns = reactive<ColumnProps[]>(props.columns);

// 扁平化 columns
const flatColumns = computed(() => flatColumnsFunc(tableColumns));

// 注入 enumMap
provide('enumMap', enumMap);

// 过滤需要搜索的配置项 && 排序
const searchColumns = computed(() => {
  return flatColumns.value
    ?.filter((item) => item.search?.el || item.search?.render)
    .sort((a, b) => a.search!.order! - b.search!.order!);
});

// 设置 搜索表单默认排序 && 搜索表单项的默认值
searchColumns.value?.forEach((column, index) => {
  column.search!.order = column.search?.order ?? index + 2;
  const key = column.search?.key ?? handleProp(column.prop!);
  const defaultValue = column.search?.defaultValue;
  if (defaultValue !== undefined && defaultValue !== null) {
    searchParam.value[key] = defaultValue;
    searchInitParam.value[key] = defaultValue;
  }
});

const _search = () => {
  search();
  emit('search');
};

const _reset = () => {
  reset();
  emit('reset');
};

const gridApi = shallowRef<GridApi | null>(null);

// 网格渲染完毕
const onGridReady = (params: GridReadyEvent) => {
  console.log('网格渲染完毕，获取实例', params);
  gridApi.value = params.api;

  if (props.requestAuto) {
    getTableList();
  }
};

// 选择行数据
const onRowSelected = () => {
  const selectedRows = gridApi.value!.getSelectedRows();
  selectionChange(selectedRows);
  emit('rowSelected', selectedRows);
};

// 清空选中数据列表
const clearSelection = () => {
  console.log('清空选中数据列表');
};

// 列设置 ===> 需要过滤掉不需要设置的列
const colRef = ref();
const colSetting = tableColumns!.filter((item) => {
  const { isSetting, prop, type } = item;
  return !columnTypes.has(type!) && prop !== 'operation' && isSetting;
});
const openColSetting = () => colRef.value.openColSetting();

// 导入drawer
const ImportDrawerRef = ref();
const openImportDrawer = () => {
  const { importFileType, ...fileConfig } = toRaw(props.fileConfig);
  ImportDrawerRef.value.handleOpen({
    ...fileConfig,
    fileType: importFileType,
  });
};

// 导出drawer
const ExportDrawerRef = ref();
const openExportDrawer = () => {
  ExportDrawerRef.value.handleOpen({
    ...props.fileConfig,
  });
};

defineExpose({
  _search,
  clearSelection,
  enumMap,
  getTableList,
  gridApi,
  handleCurrentChange,
  handleSizeChange,

  isSelected,
  pageable,
  reset,
  search,
  searchInitParam,
  searchParam,
  selectedList,
  selectedListIds,
  tableData: processTableData,
});
</script>

<template>
  <!-- 查询表单 -->
  <SearchForm
    v-show="isShowSearch"
    :columns="searchColumns"
    :is-card="isCard"
    :reset="_reset"
    :search="_search"
    :search-col="searchCol"
    :search-param="searchParam"
  />

  <!-- 统计面板 -->
  <slot
    :is-selected="isSelected"
    :selected-list="selectedList"
    :selected-list-ids="selectedListIds"
    name="statistics"
  >
  </slot>

  <!-- 表格主体 -->
  <div
    :class="[
      isCard ? 'card table-main' : 'no-card table-main',
      isScroll ? 'table-main-scroll' : '',
    ]"
  >
    <!-- 表格头部 操作按钮 -->
    <div
      v-if="
        $slots.tableHeader ||
        (toolButton && Array.isArray(toolButton) && toolButton.length > 0)
      "
      class="table-header"
    >
      <div class="header-button-lf">
        <slot
          :is-selected="isSelected"
          :selected-list="selectedList"
          :selected-list-ids="selectedListIds"
          name="tableHeader"
        ></slot>
      </div>
      <div v-if="toolButton" class="header-button-ri">
        <slot name="toolButton">
          <DKButton
            v-if="showToolButton('refresh')"
            :icon="Refresh"
            circle
            class="iconBtnCss"
            plain
            title="刷新"
            @click="getTableList"
          />
          <DKButton
            v-if="showToolButton('import') && showImportDrawerButton"
            :icon="Upload"
            :power="getPowerKey('import')"
            circle
            class="iconBtnCss"
            plain
            title="上传"
            @click="openImportDrawer()"
          />
          <DKButton
            v-if="showToolButton('export') && showExportDrawerButton"
            :icon="Download"
            :power="getPowerKey('export')"
            circle
            class="iconBtnCss"
            plain
            title="下载"
            @click="openExportDrawer()"
          />
          <DKButton
            v-if="showToolButton('setting') && columns.length > 0"
            :icon="Operation"
            :power="getPowerKey('fieldsSetting')"
            circle
            class="iconBtnCss"
            plain
            title="列设置"
            @click="openColSetting"
          />
          <DKButton
            v-if="showToolButton('search') && searchColumns?.length"
            :icon="Search"
            circle
            class="iconBtnCss"
            plain
            title="是否隐藏搜索"
            @click="isShowSearch = !isShowSearch"
          />
        </slot>
      </div>
    </div>

    <!-- 表格 -->
    <DKAgGrid
      :loading="tableLoading"
      v-bind="attrs"
      :on-grid-ready="onGridReady"
      :on-row-selected="throttle(onRowSelected, 100, { trailing: false })"
      :table-data-options="{
        columnDefs: nColumnDefs.nClos,
        rowData: processTableData,
        autoGroupColumnDef: nColumnDefs?.aClos,
      }"
    />

    <!-- 分页组件 -->
    <slot name="pagination">
      <Pagination
        v-if="pagination"
        :handle-current-change="handleCurrentChange"
        :handle-size-change="handleSizeChange"
        :pageable="pageable"
      />
    </slot>
  </div>

  <!-- 列设置 -->
  <ColSetting
    v-if="toolButton"
    ref="colRef"
    v-model:col-setting="colSetting"
    v-model:uuid="uuid"
  />

  <!-- 导入 -->
  <ImportDrawer v-if="showImportDrawerButton" ref="ImportDrawerRef" />

  <!-- 导出 -->
  <ExportDrawer v-if="showExportDrawerButton" ref="ExportDrawerRef" />
</template>
