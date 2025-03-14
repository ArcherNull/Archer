<script setup lang="ts" name="SearchForm">
import type { BreakPoint } from '#/components/Grid/interface';
import type { ColumnProps } from '#/components/ProTable/interface';

import { computed, defineExpose, defineProps, ref, withDefaults } from 'vue';

import { ArrowDown, ArrowUp, Delete, Search } from '@element-plus/icons-vue';

import GridItem from '#/components/Grid/components/GridItem.vue';
import Grid from '#/components/Grid/index.vue';

import SearchFormItem from './components/SearchFormItem.vue';

type BtnItemType = 'reset' | 'search';

interface ProTableProps {
  columns?: ColumnProps[]; // 搜索配置列
  searchParam?: { [key: string]: any }; // 搜索参数
  searchCol: number | Record<BreakPoint, number>;
  search: (params: any) => void; // 搜索方法
  reset?: (params: any) => void; // 重置方法
  isCard?: boolean; // 是否是表格样式
  btnList?: boolean | BtnItemType[];
}

// 默认值
const props = withDefaults(defineProps<ProTableProps>(), {
  btnList: true,
  columns: () => [],
  isCard: true,
  reset: () => {},
  searchCol: 2,
  searchParam: () => ({}),
});

const formRef = ref(null);

// 获取响应式设置
const getResponsive = (item: ColumnProps) => {
  return {
    lg: item.search?.lg,
    md: item.search?.md,
    offset: item.search?.offset ?? 0,
    sm: item.search?.sm,
    span: item.search?.span,
    xl: item.search?.xl,
    xs: item.search?.xs,
  };
};

// 是否默认折叠搜索项
const collapsed = ref(true);

// 获取响应式断点
const gridRef = ref();
const breakPoint = computed<BreakPoint>(() => gridRef.value?.breakPoint);

// 判断是否显示 展开/合并 按钮
const showCollapse = computed(() => {
  let show = false;
  props.columns.reduce((prev, current) => {
    prev +=
      (current.search![breakPoint.value]?.span ?? current.search?.span ?? 1) +
      (current.search![breakPoint.value]?.offset ??
        current.search?.offset ??
        0);
    if (typeof props.searchCol === 'number') {
      if (prev >= props.searchCol) show = true;
    } else {
      if (prev >= props.searchCol[breakPoint.value]) show = true;
    }
    return prev;
  }, 0);
  return show;
});

// 控制 btn 显示
const showButton = (key: BtnItemType) => {
  return Array.isArray(props.btnList)
    ? props.btnList.includes(key)
    : props.btnList;
};

const getSearchParam = () => {
  return props?.searchParam || {};
};

defineExpose({
  getSearchParam,
});
</script>
<template>
  <div
    v-if="columns.length > 0"
    :class="[isCard ? 'card table-search' : 'no-card table-search']"
  >
    <el-form ref="formRef" :model="searchParam">
      <Grid
        ref="gridRef"
        :collapsed="collapsed"
        :cols="searchCol"
        :gap="[20, 0]"
      >
        <GridItem
          v-for="(item, index) in columns"
          :key="item.prop"
          v-bind="getResponsive(item)"
          :index="index"
          :show="item.search?.isShow"
        >
          <el-form-item>
            <template #label>
              <el-space :size="4">
                <span>{{ `${item.search?.label ?? item.label}` }}</span>
                <el-tooltip
                  v-if="item.search?.tooltip"
                  :content="item.search?.tooltip"
                  effect="dark"
                  placement="top"
                >
                  <i class="iconfont icon-yiwen"></i>
                </el-tooltip>
              </el-space>
              <span>&nbsp;:</span>
            </template>
            <SearchFormItem :column="item" :search-param="searchParam" />
          </el-form-item>
        </GridItem>
        <GridItem suffix>
          <div class="operation">
            <el-button
              v-if="showButton('search')"
              :icon="Search"
              type="primary"
              @click="search(searchParam)"
            >
              搜索
            </el-button>
            <el-button
              v-if="showButton('reset')"
              :icon="Delete"
              @click="reset(searchParam)"
            >
              重置
            </el-button>
            <el-button
              v-if="showCollapse"
              class="search-isOpen"
              link
              type="primary"
              @click="collapsed = !collapsed"
            >
              {{ collapsed ? '展开' : '合并' }}
              <el-icon class="el-icon--right">
                <component :is="collapsed ? ArrowDown : ArrowUp" />
              </el-icon>
            </el-button>
          </div>
        </GridItem>
      </Grid>
    </el-form>
  </div>
</template>
