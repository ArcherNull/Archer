import { computed } from 'vue';

import { usePreferences } from '@vben-core/preferences';

import type { TablePageType } from './types';


/**
 * @description: 用于界面的hooks，该hooks用于表格动态高度
 * @param {TablePageType} tablePageType
 * @return {*}
 */
export const usePageCss = (tablePageType: TablePageType) => {
  const { isShowFooter, isShowHeaderNav, isFullContent, contentIsMaximize } =
    usePreferences();

  const tablePageCss = computed(() => {
    const pCssArr = [];

    switch (tablePageType) {
      case 'fullTable': {
        pCssArr.push('table-box');
        if (isFullContent.value) {
          pCssArr.push('table-box-spec3 p-3');
        } else {
          if (isShowFooter.value) {
            pCssArr.push('table-box-spec px-3 pt-3');
          } else {
            pCssArr.push('p-3');
          }

          if (!isShowHeaderNav.value || contentIsMaximize.value) {
            if (isShowFooter.value) {
              pCssArr.push('table-box-spec1 px-3 pt-3');
            } else {
              pCssArr.push('table-box-spec2 p-3');
            }
          }
        }
        break;
      }

      case 'tabTable': {
        pCssArr.push('table-tab-box');
        if (isFullContent.value) {
          pCssArr.push('table-tab-box-spec3');
        } else {
          if (isShowFooter.value) {
            pCssArr.push('table-tab-box-spec');
          }
          if (!isShowHeaderNav.value || contentIsMaximize.value) {
            if (isShowFooter.value) {
              pCssArr.push('table-tab-box-spec1');
            } else {
              pCssArr.push('table-tab-box-spec2');
            }
          }
        }

        break;
      }
    }

    return pCssArr.join(' ');
  });

  return tablePageCss;
};
