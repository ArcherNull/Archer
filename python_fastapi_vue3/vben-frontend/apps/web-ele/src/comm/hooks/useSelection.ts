/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-09-15 16:04:16
 * @LastEditTime: 2024-12-20 14:00:04
 * @Description:
 */
import { computed, ref } from 'vue';

/**
 * @description 表格多选数据操作
 * @param {string} rowKey 当表格可以多选时，所指定的 id
 */
export const useSelection = (rowKey: string = 'id') => {
  const isSelected = ref<boolean>(false);
  const selectedList = ref<{ [key: string]: any }[]>([]);

  // 当前选中的所有 ids 数组
  const selectedListIds = computed((): string[] => {
    const ids: string[] = [];
    selectedList.value.forEach((item) => ids.push(item[rowKey]));
    return ids;
  });

  /**
   * @description 多选操作
   * @param {Array} rowArr 当前选择的所有数据
   * @return void
   */
  const selectionChange = (rowArr: { [key: string]: any }[]) => {
    rowArr.length > 0 ? (isSelected.value = true) : (isSelected.value = false);
    selectedList.value = rowArr;
  };

  return {
    isSelected,
    selectedList,
    selectedListIds,
    selectionChange,
  };
};
