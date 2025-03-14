/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-15 15:52:26
 * @LastEditTime: 2025-01-03 11:09:16
 * @Description:
 */
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults';

import type { BreakPoint, Responsive } from '#/components/Grid/interface';
import type { ProTableProps } from '#/components/ProTable/index.vue';

import type { ComponentPublicInstance, Ref, VNode } from 'vue';

import ProTable from '#/components/ProTable/index.vue';

export interface EnumProps {
  label?: string; // 选项框显示的文字
  value?: any[] | boolean | number | string; // 选项框值
  disabled?: boolean; // 是否禁用此选项
  tagType?: string; // 当 tag 为 true 时，此选择会指定 tag 显示类型
  children?: EnumProps[]; // 为树形选择时，可以通过 children 属性指定子选项
  [key: string]: any;
}

export type TypeProps = 'expand' | 'index' | 'radio' | 'selection' | 'sort';

export type SearchType =
  | 'cascader'
  | 'date-picker'
  | 'input'
  | 'input-number'
  | 'select'
  | 'select-v2'
  | 'slider'
  | 'switch'
  | 'time-picker'
  | 'time-select'
  | 'tree-select';

export type SearchRenderScope = {
  clearable: boolean;
  data: EnumProps[];
  options: EnumProps[];
  placeholder: string;
  searchParam: { [key: string]: any };
};

export type SearchProps = {
  defaultValue?: any[] | boolean | number | Ref<any> | string; // 搜索项默认值
  el?: SearchType; // 当前项搜索框的类型
  isShow?: boolean; // 是否显示在搜索框中
  key?: string; // 当搜索项 key 不为 prop 属性时，可通过 key 指定
  label?: string; // 当前项搜索框的 label
  offset?: number; // 搜索字段左侧偏移列数
  order?: number; // 搜索项排序（从大到小）
  props?: any; // 搜索项参数，根据 element plus 官方文档来传递，该属性所有值会透传到组件
  render?: (scope: SearchRenderScope) => VNode; // 自定义搜索内容渲染（tsx语法）
  span?: number; // 搜索项所占用的列数，默认为 1 列
  tooltip?: string; // 搜索提示
} & Partial<Record<BreakPoint, Responsive>>;

export type FieldNamesProps = {
  checkStrictly?: boolean;
  children?: string;
  label: string;
  multiple?: boolean;
  value: string;
};

export type RenderScope<T> = {
  $index: number;
  [key: string]: any;
  column: TableColumnCtx<T>;
  row: T;
};

export type HeaderRenderScope<T> = {
  $index: number;
  [key: string]: any;
  column: TableColumnCtx<T>;
};

export interface ColumnProps<T = any>
  extends Partial<
    Omit<TableColumnCtx<T>, 'children' | 'renderCell' | 'renderHeader' | 'type'>
  > {
  type?: TypeProps; // 列类型
  tag?: boolean | Ref<boolean>; // 是否是标签展示
  isShow?: boolean | Ref<boolean>; // 是否显示在表格当中
  isSetting?: boolean | Ref<boolean>; // 是否在 ColSetting 中可配置
  search?: SearchProps | undefined; // 搜索项配置
  enum?: ((params?: any) => Promise<any>) | EnumProps[] | Ref<EnumProps[]>; // 枚举字典
  isFilterEnum?: boolean | Ref<boolean>; // 当前单元格值是否根据 enum 格式化（示例：enum 只作为搜索项数据）
  fieldNames?: FieldNamesProps; // 指定 label && value && children 的 key 值
  headerRender?: (scope: HeaderRenderScope<T>) => VNode; // 自定义表头内容渲染（tsx语法）
  render?: (scope: RenderScope<T>) => string | VNode; // 自定义单元格内容渲染（tsx语法）
  _children?: ColumnProps<T>[]; // 多级表头
}

export type ProTableInstance = Omit<
  InstanceType<typeof ProTable>,
  keyof ComponentPublicInstance | keyof ProTableProps
>;

export type FileConfigType = {
  template?: string; // 导入模板下载
  templateId?: string; // 导出模板id
};
