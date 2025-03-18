/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2022-12-07 10:07:13
 * @LastEditTime: 2024-07-29 15:14:08
 * @Description:
 */

// 需求字段
const headerStr = "访问IP、访问渠道、访问时间、首次访问时长、本次访问时长、是否登录、登录账号、是否注册用户、用户名称、首页访问时长、首页被访问次数、工作台页访问时长、查单功能访问次数、发整车页访问时长、发零担页访问时长、发铁路页访问时长、订单页访问时长、我的页面访问时长"
const headerArr = headerStr.split("、");
console.log("headerArr=====>", headerArr);
console.log("headerArr.length=====>", headerArr.length);

const reverseObj = (data) => {
  return Object.fromEntries(
    Object.entries(data).map((ele) => {
      return ele.reverse();
    })
  );
};

const tHeader = {
  props: [],
  titles: [],
};

const tData = {
  "customerId": "客户id",
  "clientIp": "访问IP",
  "source": "访问渠道",
  "intoTime": "进入时间(访问时间)",
  "leaveTime": "离开时间",
  "duration": "时长（秒）",
  "beLogin": "是否登录",
  "beRegister": "是否注册用户",
  "userName": "登录账号",
  "customerName": "用户名称",
  "homePageDuration": "首页访问时长",
  "homePageCount": "首页被访问次数",
  "workbenchDuration": "工作台页访问时长",
  "queryOrderCount": "查单功能访问次数",
  "completeDuration": "发整车页访问时长",
  "lessDuration": "发零担页访问时长",
  "railwayDuration": "发铁路页访问时长",
  "orderListDuration": "订单页访问时长",
  "mineDuration": "我的页面访问时长",
  "createBy": "创建人",
  "createTime": "创建时间",
  "firstTime": "访问时间"
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

console.log("obj=====>", obj);

const getNewObj = {};
obj.titles.forEach((ele, ind) => {
  getNewObj[ele] = obj.props[ind];
});

console.log("getNewObj=====>", getNewObj);


