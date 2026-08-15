/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-12-04 14:52:14
 * @LastEditors: junsong Chen 779217162@qq.com
 * @LastEditTime: 2025-12-09 21:24:37
 * @FilePath: \excel-demo\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { GenerateExcelClass } from "./generateExcel";

// 创建测试数据
const testData = [
  {
    username: "user1",
    phoneNumber: "13800138000",
    email: "user1@example.com",
    realName: "张三",
    idCardNo: "110101199001011234",
    latestLoginTime: "2024-01-01 12:00:00",
    latestLoginType: "手机登录",
  },
  {
    username: "user2",
    phoneNumber: "13800138001",
    email: "user2@example.com",
    realName: "李四",
    idCardNo: "110101199001011235",
    latestLoginTime: "2024-01-02 13:00:00",
    latestLoginType: "邮箱登录",
  },
  {
    username: "user1",
    phoneNumber: "13800138001",
    email: "user2@example.com",
    realName: "李四",
    idCardNo: "110101199001011235",
    latestLoginTime: "2024-01-02 13:00:00",
    latestLoginType: "邮箱登录",
  },
  {
    username: "user6",
    phoneNumber: "13800138001",
    email: "user2@example.com",
    realName: "李四",
    idCardNo: "110101199001011235",
    latestLoginTime: "2024-01-02 13:00:00",
    latestLoginType: "邮箱登录",
  },
  {
    username: "user8",
    phoneNumber: "13800138001",
    email: "user2@example.com",
    realName: "李四",
    idCardNo: "110101199001011235",
    latestLoginTime: "2024-01-02 13:00:00",
    latestLoginType: "邮箱登录",
  },
];

const options = {
  fileName: "用户数据1",
  sheets: [
    {
      sheetName: "在用用户",
      mapping: {
        基础信息: {
          用户名称: "username",
          手机号: "phoneNumber",
          邮箱: "email",
        },
        敏感信息: {
          真实姓名: "realName",
          身份证: "idCardNo",
        },
        最近登录时间: "latestLoginTime",
        最近登录方式: "latestLoginType",
      },
      tableData: testData,
      filter: true,
      rowStyle: (row: any) => {
        if (row.username === "user8") {
          return {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF1B8FF" },
            bgColor: { argb: "FFF1B8FF" },
          };
        }
      },
      colStyle: (options: any, row: any) => {
        const { field, value } = options;
        if (field === "realName" && value === "张三") {
          return {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF4D4F" },
            bgColor: { argb: "FFFF4D4F" },
          };
        }

        if (field === "username") {
          return {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD9F7BE" },
            bgColor: { argb: "FFD9F7BE" },
          };
        }
      },
    },
    {
      sheetName: "注销用户",
      mapping: {
        用户名称: "username",
        手机号: "phoneNumber",
        邮箱: "email",
        真实姓1名: "realName",
        身份证2: "idCardNo",
        测试最近登录时间: "latestLoginTime",
        最近登录方式: "latestLoginType",
      },
      tableData: testData,
      rowStyle: (row: any) => {
        if (row.username === "user1") {
          return {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF1B8FF" },
            bgColor: { argb: "FFF1B8FF" },
          };
        }
      },
    },
    {
      sheetName: "多表格头表格",
      mapping: {
        用户列表: {
          基础信息: {
            用户名称1: "username",
            手机2号: "phoneNumber",
            s邮箱: "email",
          },
          敏感信息: {
            真实姓1名: "realName",
            身份证2: "idCardNo",
          },
          最近登1录时间: "latestLoginTime",
          最近4登录方式: "latestLoginType",
        },
        用户列表1: {
          基础信息: {
            用户名称1: "username",
            手机2号: "phoneNumber",
            s邮箱: "email",
          },
          敏感信息: {
            真实姓1名: "realName",
            身份证2: "idCardNo",
          },
          最近登1录时间: "latestLoginTime",
          最近4登录方式: "latestLoginType",
        },
      },
      tableData: testData,
      rowStyle: (row: any) => {
        if (row.username === "user1") {
          return {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF1B8FF" },
            bgColor: { argb: "FFF1B8FF" },
          };
        }
      },
    },
  ],
  fileType: "file",
};

// 测试generateExcel方法
async function testGenerateExcel() {
  try {
    const excelGenerator = new GenerateExcelClass();
    const workbook = await excelGenerator.exportExcel(options);

    // 保存Excel文件到磁盘
    await workbook.xlsx.writeFile(`${options.fileName}.xlsx`);
    console.log(`Excel文件已生成: ${options.fileName}.xlsx`);
  } catch (error) {
    console.error("生成Excel文件失败:", error);
  }
}

testGenerateExcel();
