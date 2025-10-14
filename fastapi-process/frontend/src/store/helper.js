import api from "@/api";
import { basePermissions } from "@/settings";

export async function getUserInfo() {
  const res = await api.getUser();
  const { id, name, nickName, role, email } = res.data || {};
  return {
    id,
    username: name,
    avatar: "https://img.isme.top/isme/67bd93db39a90.png",
    nickName,
    gender: 1,
    address: "广东省深圳市",
    email,
    roles: [role],
    currentRole: role,
  };
}

export async function getPermissions() {
  let asyncPermissions = [];
  try {
    // const res = await api.getRolePermissions();
    const res = await new Promise((resolve) => {
      resolve({
        data: [
          {
            id: 2,
            name: "系统管理",
            code: "SysMgt",
            type: "MENU",
            parentId: null,
            path: null,
            redirect: null,
            icon: "i-fe:grid",
            component: null,
            layout: null,
            keepAlive: null,
            method: null,
            description: null,
            show: true,
            enable: true,
            order: 2,
            children: [
              {
                id: 4,
                name: "用户管理",
                code: "UserMgt",
                type: "MENU",
                parentId: 2,
                path: "/pms/user",
                redirect: null,
                icon: "i-fe:user",
                component: "/src/views/pms/user/index.vue",
                layout: null,
                keepAlive: true,
                method: null,
                description: null,
                show: true,
                enable: true,
                order: 1,
                children: [],
              },

              {
                id: 4,
                name: "工单管理",
                code: "WorkOrderMgt",
                type: "MENU",
                parentId: 2,
                path: "/pms/work-order",
                redirect: null,
                icon: "i-me:dialog",
                component: "/src/views/pms/work-order/index.vue",
                layout: null,
                keepAlive: true,
                method: null,
                description: null,
                show: true,
                enable: true,
                order: 1,
                children: [],
              },

              {
                id: 4,
                name: "流程管理",
                code: "ProcessSettingMgt",
                type: "MENU",
                parentId: 2,
                path: "/pms/process-setting",
                redirect: null,
                icon: "i-me:awesome",
                component: "/src/views/pms/process-setting/index.vue",
                layout: null,
                keepAlive: true,
                method: null,
                description: null,
                show: true,
                enable: true,
                order: 1,
                children: [],
              },

              {
                id: 4,
                name: "邮箱管理",
                code: "EmailMgt",
                type: "MENU",
                parentId: 2,
                path: "/pms/email",
                redirect: null,
                icon: "i-fe:mail",
                component: "/src/views/pms/email/index.vue",
                layout: null,
                keepAlive: true,
                method: null,
                description: null,
                show: true,
                enable: true,
                order: 1,
                children: [],
              },
            ],
          },
          {
            id: 8,
            name: "个人资料",
            code: "UserProfile",
            type: "MENU",
            parentId: null,
            path: "/profile",
            redirect: null,
            icon: "i-fe:user",
            component: "/src/views/profile/index.vue",
            layout: null,
            keepAlive: null,
            method: null,
            description: null,
            show: false,
            enable: true,
            order: 99,
          },
        ],
      });
    });
    asyncPermissions = res?.data || [];
  } catch (error) {
    console.error(error);
  }
  return basePermissions.concat(asyncPermissions);
}
