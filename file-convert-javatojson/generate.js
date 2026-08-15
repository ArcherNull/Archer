/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2022-12-07 10:07:13
 * @LastEditTime: 2025-08-18 16:42:30
 * @Description:
 */

// 需求字段
const headerStr = "客户名称、应用项目部、状态、月结卡号、业务类型、顺丰产品名称、顺丰计价方式、运输类型、服务方式、计费方式、阶梯类型、计算方式、备注、创建人、创建时间、更新人、更新时间"
const headerArr = headerStr.split("、");
console.log("headerArr=====>", headerArr);
console.log("headerArr.length=====>", headerArr.length);

const reverseObj = (data) => {
  return Object.fromEntries(
    Object.entries(data).map((ele) => {
      return ele.reverse();
    }),
  );
};

const tHeader = {
  props: [],
  titles: [],
};

const tData = {
  "id": "id",
  "customerId": "客户ID",
  "prodivisionId": "prodivision_id",
  "monthlyCardNo": "月结卡号",
  "businessType": "业务类型",
  "sfProductName": "顺丰产品名称",
  "sfPriceType": "顺丰计价方式",
  "configState": "状态",
  "transitType": "运输类型",
  "serviceFormula": "服务方式",
  "calculateStandardId": "计费基准id",
  "calculateStandardName": "计费方式",
  "ladderType": "阶梯类型",
  "calculateMode": "计算方式",
  "remark": "备注",
  "revision": "REVISION",
  "createdById": "创建人id",
  "createdBy": "创建人",
  "createdTime": "创建时间",
  "updatedById": "更新人id",
  "updatedBy": "更新人",
  "updatedTime": "更新时间",
  "companyId": "company_id",
  "customerName": "客户名称",
  "prodivisionName": "应用项目部"
};

const reset = [];
Object.keys(tData).forEach((ele) => {
  const val = tData[ele];
  const key = ele;

  if (headerArr.includes(val)) {
    tHeader.props.push(key);
    tHeader.titles.push(val);
  } else {
    reset.push(`${key}:${val}`);
  }
});
console.log("reset", reset);
console.log("tHeader", tHeader);
console.log("tHeader", tHeader.props.length);

const diffArr = headerArr.filter((ele) => !tHeader.titles.includes(ele));
console.log("diffArr", diffArr);

const nsObj = {
  订单号: "objectNo",
  核销剩余金额: "核销剩余金额",
  增减流水号: "增减流水号",
  账单明细金额: "billDetailMoney",
  增减金额: "otherFee",
  费用类型: "feeType",
  结算方式: "结算方式",
  账单号: "billNo",
  结算币种: "结算币种",
  订单税率: "taxRate",
  客户名称: "customerName",
  项目部: "prodivisionName",
  开单时间: "开单时间",
  增减时间: "增减时间",
  摘要: "摘要",
};

const obj = {
  props: [],
  titles: [],
};
const rData = reverseObj(tData);
headerArr.forEach((ele) => {
  if (rData[ele]) {
    obj.titles.push(ele);
    obj.props.push(rData[ele]);
  } else {
    obj.props.push(ele);
    obj.titles.push(ele);
  }
});

// console.log("obj=====>", obj);

const getNewObj = {};
obj.titles.forEach((ele, ind) => {
  getNewObj[ele] = obj.props[ind];
});

console.log("getNewObj=====>", getNewObj);


