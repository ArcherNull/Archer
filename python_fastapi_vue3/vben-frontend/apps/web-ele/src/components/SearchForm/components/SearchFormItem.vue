<script setup lang="ts" name="SearchFormItem">
import type { ColumnProps } from '#/components/ProTable/interface';

import { computed, defineProps, inject, ref } from 'vue';

import { handleProp } from '#/comm/utils';

interface SearchFormItem {
  column: ColumnProps;
  searchParam: { [key: string]: any };
}
const props = defineProps<SearchFormItem>();

// Re receive SearchParam
const _searchParam = computed(() => props.searchParam);

// 判断 fieldNames 设置 label && value && children 的 key 值
const fieldNames = computed(() => {
  return {
    checkStrictly: props.column.fieldNames?.checkStrictly ?? false,
    label: props.column.fieldNames?.label ?? 'label',
    multiple: props.column.fieldNames?.multiple ?? false,
    value: props.column.fieldNames?.value ?? 'value',
    children: props.column.fieldNames?.children ?? 'children',
  };
});

// 接收 enumMap (el 为 select-v2 需单独处理 enumData)
const enumMap = inject('enumMap', ref(new Map()));
const columnEnum = computed(() => {
  let enumData = enumMap.value.get(props.column.prop);

  // 如果select中props有单独设置 options ，则返回options
  if (['cascader', 'select', 'select-v2'].includes(props.column.search?.el!)) {
    const options = props.column.search?.props?.options || [];
    if (options?.length > 0) return options;
  }

  if (!enumData) return [];
  if (props.column.search?.el === 'select-v2' && props.column.fieldNames) {
    enumData = enumData.map((item: { [key: string]: any }) => {
      return {
        ...item,
        label: item[fieldNames.value.label],
        value: item[fieldNames.value.value],
      };
    });
  }
  return enumData;
});

// 处理透传的 searchProps (el 为 tree-select、cascader 的时候需要给下默认 label && value && children)
const handleSearchProps = computed(() => {
  const label = fieldNames.value.label;
  const value = fieldNames.value.value;
  const children = fieldNames.value.children;
  const checkStrictly = fieldNames.value.checkStrictly;
  const multiple = fieldNames.value?.multiple || false;
  const searchEl = props.column.search?.el;
  let searchProps = props.column.search?.props ?? {};
  if (searchEl === 'tree-select') {
    searchProps = {
      ...searchProps,
      nodeKey: value,
      props: { ...searchProps, label, children },
    };
  }
  if (searchEl === 'cascader') {
    searchProps = {
      ...searchProps,
      props: {
        ...searchProps,
        checkStrictly,
        label,
        multiple,
        value,
        children,
      },
    };
  }
  return searchProps;
});

// 处理默认 placeholder
const placeholder = computed(() => {
  const search = props.column.search;
  if (
    ['daterange', 'datetimerange', 'monthrange'].includes(
      search?.props?.type,
    ) ||
    search?.props?.isRange
  ) {
    return {
      endPlaceholder: search?.props?.endPlaceholder ?? '结束时间',
      rangeSeparator: search?.props?.rangeSeparator ?? '至',
      startPlaceholder: search?.props?.startPlaceholder ?? '开始时间',
    };
  }
  const placeholder =
    search?.props?.placeholder ??
    (search?.el?.includes('input') ? '请输入' : '请选择');
  return { placeholder };
});

// 是否有清除按钮 (当搜索项有默认值时，清除按钮不显示)
const clearable = computed(() => {
  const search = props.column.search;
  return (
    search?.props?.clearable ??
    (search?.defaultValue === null || search?.defaultValue === undefined)
  );
});

const selectComp = ref('el-option');
</script>

<template>
  <component
    :is="column.search?.render ?? `el-${column.search?.el}`"
    v-bind="{
      ...handleSearchProps,
      ...placeholder,
      searchParam: _searchParam,
      clearable,
    }"
    :data="column.search?.el === 'tree-select' ? columnEnum : []"
    :options="
      ['cascader', 'select-v2'].includes(column.search?.el!) ? columnEnum : []
    "
    v-model.trim="_searchParam[column.search?.key ?? handleProp(column.prop!)]"
  >
    <template v-if="column.search?.el === 'cascader'" #default="{ data }">
      <span>{{ data[fieldNames.label] }}</span>
    </template>
    <template v-if="column.search?.el === 'select'">
      <component
        :is="selectComp"
        v-for="(col, index) in columnEnum"
        :key="index"
        :label="col[fieldNames.label]"
        :value="col[fieldNames.value]"
      />
    </template>
    <slot v-else></slot>
  </component>
</template>
