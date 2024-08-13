import { message as Message } from "ant-design-vue";

export const EXCEL = {
  /**
   * @description: Excel导表方法封装
   * @param {string[]} tHeader 表格第一行标题，例如['吸粉公众号', '吸粉数', '日期']
   * @param {object[]} data  过滤处理的数据
   * @param {string[]} lastRow  表格自定义最后一行
   * @param {string} title  导出表格文件的标题
   */
  exportExcel: function (dataObj) {
    const { tHeader, data, lastRow, title } = dataObj;
    return new Promise((resolve) => {
      require.ensure([], () => {
        const { export_json_to_excel } = require("./Export2Excel"); // 注意这个Export2Excel路径
        data.push(...lastRow); // 在导表的最后一行加入总数
        export_json_to_excel(tHeader, data, title); // 最后一个是表名字
        resolve(true);
      });
    });
  },

  /**
   * @description: Excel数据过滤数据方法，例如时间格式
   * @param {string[]} filterVal 过滤键值
   * @param {object[]} jsonData 过滤数据
   * @return {} 返回对应的数据
   */
  formatJson: function (filterVal, jsonData) {
    return jsonData.map((v) => filterVal.map((j) => v[j]));
  },

  /**
   * @description: Excel数据过滤数据方法，例如时间格式 【将金额转为数字】
   * @param {string[]} filterVal 过滤键值
   * @param {object[]} jsonData 过滤数据
   * @return {} 返回对应的数据
   */
  formatJson1: function (filterVal, jsonData) {
    const formatExcelData = (str) => {
      if (str) {
        if (/[Fee|Money|Price|Pay|Weight|Volume]$/g.test(str)) {
          const val = Number(str);
          // 导出excel超出11位，会被转换为科学计数法，通过加入' ，强制转换为字符串
          if (isNaN(val)) {
            return str;
          } else {
            if (val.toString().length > 10) {
              return `'${val}`;
            } else {
              return val;
            }
          }
        } else {
          return str;
        }
      } else {
        return str;
      }
    };
    return jsonData.map((v) =>
      filterVal.map((j) => {
        const str = v[j];
        return formatExcelData(str);
      })
    );
  },

  /**
   * @description: 导柱形图excel表
   * @param {string[]} tHeader 表头数据 ，现在只适用一级表头， string[] , 例如['时间', '吸粉数']
   * @param {string[]} filterVal 表格列数据，必须与表头相对应，string[] , 例如['time', 'number']
   * @param {object[] } tableData 表格行数据
   * @param {string} title 导出表格的文件标题
   * @param {any[]} lastRow 可自定义最后一行数据， string[] ，注意其长度最好是与表头相对应
   * @return {*}
   */

  exportExcelFun: function (data) {
    // console.log('导柱形图excel表数据', data)
    const that = this;
    // 请求后端接口拿到list数据
    if (Array.isArray(data.tableData)) {
      const dataObj = {
        tHeader: data.tHeader,
        filterVal: data.filterVal,
        lastRow: data.lastRow || [],
        title: data.title || "downLoadExcel",
        data: function () {
          // 这里存在一个this指针指向的问题
          return that.formatJson1(data.filterVal, data.tableData);
        },
      };
      // console.log('dataObj.data()', dataObj.data())
      dataObj.data = dataObj.data(); // 过滤函数立即执行，返回对应的表格数据
      that.exportExcel(dataObj).then((res) => {
        if (res) {
          // console.log('下载Excel成功！')
          Message.success(`文件名为${dataObj.title}的Excel表格导出成功！`);
        } else {
          Message.error(`文件名为${dataObj.title}的Excel表格导出失败！`);
        }
      });
    } else {
      Message.warning("请选择对应的数据！");
    }
  },

  /* 
  参考文档：https://juejin.cn/post/7282950051319595066?searchId=202405061028396619942978A84BCD82DB
  上面给出的代码是一个导出Excel通用方法的示例。让我们逐步解析其中的关键逻辑：

  1、首先，在函数的参数中，我们传入了一些必要的参数，如多级表头（multiHeader和multiHeader2）、数据过滤列（filterVal）、表格数据（tableData）、表格标题（title）和索引号（indexNumber）。这些参数会作为函数的输入，用于生成Excel文件。
  2、接下来，我们定义了一些常量，如导出文件名称（EXPORT_FILENAME）和两种不同样式的单元格样式（style1和style2）。这些样式可以用于美化导出的Excel表格，使其更加具有可读性和专业感。
  3、在进行表头的合并和样式设置之后，我们使用import语法引入了名为Export2Excel.js的库文件。这个库文件是用于实现数据导出到Excel的核心工具，我们可以调用其中的export_json_to_excelhb方法来实现导出功能。
  4、最后，我们将整理好的数据、需要导出的文件名、表头样式和单元格合并信息作为参数，调用export_json_to_excelhb方法实现导出操作。
  */

  /**
   * @description: 导出StyleExcel通用方法
   * @param {string[]} multiHeader 多级表头1
   * @param {string[]} multiHeader 多级表头2
   * @param {string[]} filterVal 数据过滤列
   * @param {object[]} tableData 表格数据
   * @param {string} title 表格标题
   * @param {number} indexNumber 索引号
   * @param {number} num2 进行所有表头的单元格合并, 默认为1
   * @return {*}
   */
  exportStyleExcel(config) {
    const {
      multiHeader,
      multiHeader2,
      filterVal,
      tableData,
      title,
      indexNumber,
      num2 = 1,
    } = config;

    console.log("config123123123", config);

    // 导出标题
    const EXPORT_FILENAME = title;
    // 单元格样式1 dbf3f2
    const style1 = {
      fill: { patternType: "solid", fgColor: { rgb: "dbf3f2" } },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
      alignment: { horizontal: "center", vertical: "center", wrapText: 1 },
    };
    // 单元格样式2 fbedd7
    const style2 = {
      fill: { patternType: "solid", fgColor: { rgb: "fbedd7" } },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
      alignment: { horizontal: "center", vertical: "center", wrapText: 1 },
    };
    // 进行所有表头的单元格合并
    let headerList = [];
    let titleList = [];
    let styleNumber = 1; // 初始为1 1级表头样式判断
    let headerStyle = style2;
    let rowIndex = 1;
    let colIndex = 1;
    let isOdd = true;
    let count = 0;
    const indexNumber2 = indexNumber + 1;
    // 一级表头合并与颜色赋值
    if (multiHeader && multiHeader.length > 0) {
      multiHeader.forEach(() => {
        if (rowIndex < multiHeader.length) {
          headerList.push({
            s: { r: 0, c: rowIndex },
            e: { r: 0, c: rowIndex + indexNumber },
            style: headerStyle,
          });
          rowIndex += indexNumber2;
        }
        // 修改样式值
        if (styleNumber === 1) {
          styleNumber = 2; // 修改样式值
          headerStyle = style1;
        } else {
          styleNumber = 1; // 修改样式值
          headerStyle = style2;
        }
      });
    }
    if (multiHeader2 && multiHeader2.length > 0) {
      multiHeader2.forEach(() => {
        if (colIndex < multiHeader2.length) {
          titleList.push({
            s: { r: 1, c: colIndex },
            e: { r: 1, c: colIndex },
            style: isOdd ? style2 : style1,
          });
          colIndex += 1;
          count++;
        }
        if (count % indexNumber2 === 0) {
          isOdd = !isOdd;
        }
      });
    }
    // 进行所有表头的单元格合并 num2改为动态的 可默认可自定义
    const merges = [
      // 将A1和A2合并，并设置背景色1
      {
        s: { r: 0, c: 0 },
        e: { r: num2, c: 0 },
        style: {
          fill: { patternType: "solid", fgColor: { rgb: "d4e6fd" } },
          border: {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          },
          alignment: { horizontal: "center", vertical: "center", wrapText: 1 },
        },
      },
      ...headerList,
      ...titleList, // 二级表头
    ];
    const data = tableData.map((v) => filterVal.map((j) => v[j]));

    return new Promise((resolve) => {
      require.ensure([], () => {
        const { export_json_to_excelhb } = require("./Export2StyleExcel"); // 注意这个Export2Excel路径
        export_json_to_excelhb({
          multiHeader: [multiHeader], // 这里是第一行的表头
          multiHeader2: [multiHeader2], // 这里是第二行的表头
          data,
          filename: EXPORT_FILENAME,
          merges,
        }); // 最后一个是表名字
        resolve(true);
      });
    });
  },
};
