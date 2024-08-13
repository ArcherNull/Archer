/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-29 14:48:07
 * @LastEditTime: 2023-09-13 09:13:47
 * @Description:
 */
const Mock = require("mockjs");

// 用户列表假数据
exports.getUserMockSeeds = () => {
  return Mock.mock({
    "data|2000-2500": [
      {
        "userName|5-10": "@cname",
        userImg: "@url",
        "userRole|1": ["管理员", "普通用户"],
        "userState|1": [0, 1, 2],
        "authState|1": [0, 1, 2, 3],
        "sex|1": [0, 1, 2],
        realName: "@cname",
        birthday: "@datetime('y-MM-dd HH:mm:ss')",
        idCardNo:
          /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
        phoneNumber: /(^$)|^1\d{10}$/,
        age: "@natural(18, 60)",
        email: "@email()",
        province: "@province",
        provinceId: "@increment(100000)",
        city: "@city",
        cityId: "@increment(500000)",
        area: "@county",
        areaId: "@increment(200000)",
        address: "@county(true)",
        longitude: 116.72923,
        latitude: 39.916403,
        password: /[a-z][A-Z][0-9]/,
        token: "@guid",
        remark: "@cparagraph(1)",
        "registerFrom|1": [0, 1, 2],
        "userTags|1": ["软件定制开发", "云平台定制"],
        createdAt: "@datetime('y-MM-dd HH:mm:ss')",
        updatedAt: "@datetime('y-MM-dd HH:mm:ss')",
      },
    ],
  });
};
