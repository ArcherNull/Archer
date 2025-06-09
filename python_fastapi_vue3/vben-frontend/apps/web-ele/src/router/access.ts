/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-05-27 19:18:18
 * @LastEditTime: 2025-06-03 09:35:03
 * @Description:
 */
import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
  RouteRecordStringComponent,
} from '@vben/types';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';

import { ElMessage } from 'element-plus';

import { getMenuRouters } from '#/api/core/auth';
import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';
import { isNotEmptyArr } from '#/comm/utils/index';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

function generateAjaxRoutes(
  ajaxData: any[],
  pItem?: any,
): RouteRecordStringComponent[] {
  return Array.isArray(ajaxData) && ajaxData.length > 0
    ? ajaxData.map((ele, index) => {
        const nPath = [pItem?.path, ele.path].filter(Boolean).join('/');
        const obj: any & RouteRecordStringComponent = {
          meta: {
            affixTab: ele?.affixTab || false,
            icon: ele?.meta?.icon,
            iframeSrc: Boolean(ele?.meta?.link),
            keepAlive: Boolean(ele?.meta?.noCache), // Boolean(Number(ele?.keepAlive)),
            // link: ele?.link,
            order: ele?.orderNum,
            title: ele.meta.title,
          },
          name: ele.name,
          path: nPath,
          children: [],
        };

        if (pItem?.path && ele.menuType === 'M' && index === 0) {
          pItem.redirect = nPath;
        }

        if (ele.menuType === 'M' && !pItem) {
          obj.component = 'BasicLayout';
        }

        if (
          ele.menuType === 'C' &&
          ele.component &&
          ele.path &&
          !obj.meta.iframeSrc
        ) {
          obj.component = ele.component;
        }

        if (ele?.children?.length) {
          obj.children = generateAjaxRoutes(ele.children, obj);
        }

        return obj;
      })
    : [];
}

const commPath = [
  {
    component: 'BasicLayout',
    meta: {
      icon: 'lucide:layout-dashboard',
      order: 0.5,
      title: 'page.dashboard.title',
    },
    name: 'dashboard',
    path: '/',
    redirect: '/analytics',
    children: [
      {
        name: 'analytics',
        path: '/analytics',
        component: '/views/dashboard/analytics/index.vue',
        meta: {
          affixTab: true,
          icon: 'lucide:area-chart',
          title: 'page.dashboard.analytics.title',
        },
      },
      {
        name: 'workspace',
        path: '/workspace',
        component: '/views/dashboard/workspace/index.vue',
        meta: {
          icon: 'carbon:workspace',
          title: 'page.dashboard.workspace.title',
        },
      },
    ],
  },
];

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      ElMessage({
        duration: 1500,
        message: `${$t('common.loadingMenu')}...`,
      });
      const res = await getMenuRouters();
      console.log('getMenuRouters123123123', res);
      const menuList = isNotEmptyArr(res?.data) ? res.data : [];
      const newMenuList = generateAjaxRoutes(menuList);
      return [...commPath, ...newMenuList];
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });
}

export { generateAccess };
