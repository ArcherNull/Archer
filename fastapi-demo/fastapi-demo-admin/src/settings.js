/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-04-16 11:40:21
 * @LastEditTime: 2025-04-22 15:40:29
 * @Description:
 */

export const defaultLayout = "normal";

export const defaultPrimaryColor = "#316C72";

// 控制 LayoutSetting 组件是否可见
export const layoutSettingVisible = true;

export const naiveThemeOverrides = {
  common: {
    primaryColor: "#316C72FF",
    primaryColorHover: "#316C72E3",
    primaryColorPressed: "#2B4C59FF",
    primaryColorSuppl: "#316C72E3",
  },
};

export const basePermissions = [
  {
    code: "ExternalLink",
    name: "接口文档",
    type: "MENU",
    icon: "i-fe:external-link",
    order: 98,
    enable: true,
    show: true,
    children: [
      {
        code: "SwaggerDocs",
        name: "swagger文档",
        type: "MENU",
        path: "http://127.0.0.1:8006/docs",
        icon: "i-me:apifox",
        order: 1,
        enable: true,
        show: true,
      },
      {
        code: "ReDocs",
        name: "redoc文档",
        type: "MENU",
        path: "http://127.0.0.1:8006/redoc",
        icon: "i-me:docs",
        order: 2,
        enable: true,
        show: true,
      },
    ],
  },
];
