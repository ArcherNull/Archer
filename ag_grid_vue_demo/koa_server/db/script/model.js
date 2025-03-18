/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-10-11 15:46:43
 * @LastEditTime: 2024-07-22 19:11:27
 * @Description: 表模型字段
 *
 * 表名不能重复
 *
 */

// 公共字段
let commonFields = {
  // 数据状态， 0-禁用，1-启用。此state优先级大于数据自定义的表state。用于表示数据软删除
  state: "integer",
  // 商铺id, 如果存在商铺id,则表示是商铺数据，如果不存在表示为顾客【购物】。如果存在表示商家【备货】，商铺id用于数据隔离。一个用户只能绑定一个商铺
  storeId: "integer",
  // 版本号，乐观锁， 可以有效防止数据重复更新
  // version: "integer",
  // 备注
  remark: "string",
  // 更新人
  updateBy: "string",
  // 更新人id
  updateById: "integer",
  // 创建人
  createBy: "string",
  // 创建人id
  createById: "integer",
};

const getRegionFields = (perfix) => {
  const regionObj = {
    // 省
    province: "string",
    provinceId: "integer",
    // 市
    city: "string",
    cityId: "integer",
    // 区
    area: "string",
    areaId: "integer",
    // 详细地址
    address: "string",

    longitude: 'decimal',
    latitude: 'decimal',
  };
  if (perfix) {
    let newObj = {};
    const keysArr = Object.keys(regionObj);
    keysArr.forEach((ele) => {
      const upperFirstChar = ele.replace(/\b\w/g, function (th) {
        return th.toUpperCase();
      });
      const newKey = perfix + upperFirstChar;
      newObj[newKey] = regionObj[ele];
    });
    return newObj;
  } else {
    return regionObj;
  }
};

// 地理位置字段
let regionFields = {
  // 省
  province: "string",
  provinceId: "integer",
  // 市
  city: "string",
  cityId: "integer",
  // 区
  area: "string",
  areaId: "integer",
  // 详细地址
  address: "string",
  // 经纬度，逗号拼接 , 经度[lng] + ',' + 纬度[lat]
  lngAndLat: "string",
};

// 用户表
let userTable = {
  name: "user",
  comment: "用户表",
  attributes: {
    // 用户名
    userName: "string",
    // 用户头像
    userImg: "string",
    // 用户角色, 超级管理员 ， 管理员 ， 普通用户
    userRole: "string",
    // 用户状态，0-禁用，1-启用
    userState: "bigInt",
    // 认证状态，0-未认证，1-实名认证
    authState: "bigInt",
    // 性别，0-未知，1-女，2-男
    sex: "bigInt",
    // 真实姓名
    realName: "string",
    // 生日
    birthday: "date",
    // 身份证号
    idCardNo: "string",
    // 手机号码
    phoneNumber: "string",
    // 年龄
    age: "bigInt",
    // 邮箱
    email: "string",
    // 密码
    password: "string",
    // token 参数
    token: "string",
    // 数据注册来源于，0-官网，1-小程序，2-管理后台，3-其它
    registerFrom: "integer",
    // 用户当前位置
    ...regionFields,

    ...commonFields,
  },
};

// 订单表
let orderTable = {
  name: "order",
  comment: "订单表",
  attributes: {
    searchValue: 'string',
    params: 'string',
    pageSize: 'string',
    pageNum: 'string',
    orderByColumn: 'string',
    isAsc: 'string',
    fieldSort: 'string',
    likeField: 'string',
    prodivisionIds: 'string',
    startTime: 'date',
    endTime: 'date',
    objectIdList: 'string',
    commonTime: 'date',
    objectStrList: 'string',
    yesOrNoField: 'string',
    inField: 'string',
    gtField: 'string',
    ltField: 'string',
    commStrValue: 'string',
    orderBy: 'string',
    isTrue: 'string',
    companyIds: 'string',
    notNeedLimit: 'string',
    orderId: 'integer',
    revision: 'string',
    createdById: 'integer',
    createdBy: 'string',
    createdTime: 'date',
    updatedById: 'integer',
    updatedBy: 'string',
    updatedTime: 'date',
    orderNo: 'string',
    customerNo: 'string',
    sourceNo: 'string',
    orderDate: 'date',
    orderState: 'string',
    orderStates: 'string',
    calculationFormula: 'string',
    serviceFormula: 'string',
    carType: 'string',
    carLength: 'decimal',
    handoverMode: 'string',
    nowPay: 'decimal',
    fetchPay: 'decimal',
    monthPay: 'decimal',
    paymentMode: 'string',
    customerId: 'integer',
    customerName: 'string',
    customerCompany: 'string',
    beginCompany: 'string',
    beginMan: 'string',
    beginPhone: 'string',
    beginAddress: 'string',
    beginProvince: 'string',
    beginProvinceid: 'string',
    beginCity: 'string',
    beginCityid: 'string',
    beginArea: 'string',
    beginAreaid: 'string',
    beginStreet: 'string',
    beginStreetid: 'string',
    endCompany: 'string',
    endMan: 'string',
    endPhone: 'string',
    endAddress: 'string',
    endProvince: 'string',
    endProvinceid: 'string',
    endCity: 'string',
    endCityid: 'string',
    endArea: 'string',
    endAreaid: 'string',
    endStreet: 'string',
    endStreetid: 'string',
    salesMan: 'string',
    salesManPhone: 'string',
    deliveryDate: 'date',
    arriveDate: 'date',
    isReceipt: 'string',
    receiptNum: 'decimal',
    receiptRequirement: 'string',
    taxRate: 'string',
    cancelMan: 'string',
    cancelDate: 'date',
    orderRemark: 'string',
    deliveryFee: 'decimal',
    trunklineFee: 'decimal',
    terminalFee: 'decimal',
    basicFee: 'decimal',
    totalFee: 'decimal',
    surplusTotalFee: 'decimal',
    otherFee: 'decimal',
    otherFeeRemark: 'string',
    planCostFee: 'decimal',
    planProfitFee: 'decimal',
    addCutFee: 'decimal',
    operationType: 'string',
    billState: 'string',
    surplusNowPay: 'decimal',
    surplusFetchPay: 'decimal',
    surplusMonthPay: 'decimal',
    prodivisionName: 'string',
    prodivisionId: 'integer',
    financialId: 'integer',
    companyId: 'integer',
    orderStateList: 'string',
    augmentIds: 'string',
    augmentNos: 'string',
    augmentFee: 'string',
    busOrderCustomerVoList: 'string',
    busOrderDetailVoList: 'string',
    busOrderOtherfeeVoList: 'string',
    confirm: 'string',
    orderAuditMan: 'string',
    orderAuditDate: 'date',
    orderNum: 'decimal',
    orderWeight: 'decimal',
    orderVolume: 'decimal',
    calculationWeight: 'decimal',
    calculationVolume: 'decimal',
    orderIds: 'string',
    receiptPay: 'decimal',
    receiptState: 'string',
    transitType: 'string',
    noteNo: 'string',
    beginSite: 'string',
    endSite: 'string',
    declaredValue: 'decimal',
    payMan: 'string',
    productType: 'string',
    trackState: 'string',
    billingDepartment: 'string',
    costAndFreight: 'string',
    verifyoffMoney: 'decimal',
    verifyoffState: 'string',
    salesDept: 'string',
    goodsNature: 'string',
    homeType: 'string',
    isAccountBill: 'string',
    mainId: 'integer',
    invoiceMain: 'string',
    supplierId: 'integer',
    supplierName: 'string',
    isMiddle: 'string',
    costShare: 'decimal',
    costRate: 'decimal',
    orderSplitCount: 'string',
    kilometers: 'string',
    financeAuditState: 'string',
    financeAuditUser: 'string',
    financeAuditUserId: 'integer',
    financeAuditDate: 'date',
    auditStatus: 'string',
    deliveryCost: 'decimal',
    trunklineCost: 'decimal',
    vehicleCost: 'decimal',
    terminalCost: 'decimal',
    isInsure: 'decimal',
    insureCount: 'string',
    insureWaybill: 'string',
    distance: 'decimal',
    aging: 'decimal',
    calculationPrice1: 'decimal',
    calculationPrice2: 'decimal',
    deliveryPrice1: 'decimal',
    deliveryPrice2: 'decimal',
    sendPrice1: 'decimal',
    sendPrice2: 'decimal',
    calculateMode: 'string',
    calculateStandardId: 'integer',
    calculateStandardName: 'string',
    ladderType: 'string',
    calculateJson: 'string',
    calculateResult: 'string',
    notTaxMoney: 'decimal',
    isDelete: 'string',
    assignPerson: 'string',
    assignTime: 'date',
    acceptPerson: 'string',
    acceptTime: 'date',
    deliverType: 'string',
    supplierHierarchy: 'string',
    secondSupplierId: 'integer',
    secondSupplierName: 'string',
    acceptState: 'string',
    joinCompanyId: 'integer',
    joinCompanyName: 'string',
    joinProdivisionName: 'string',
    joinProdivisionId: 'integer',
    isSystemInside: 'string',
    isJoin: 'string',
    isPushHgj: 'string',
    mhbDeviceNo: 'string',
    mhbDeviceState: 'string',
    taxType: 'string',
    trunkLineFeeNoTax: 'decimal',
    assistFee: 'decimal',
    assistFeeRate: 'string',
    assistFeeNoTax: 'decimal',
    surplusAssistFee: 'decimal',
    surplusAssistFeeMonth: 'decimal',
    surplusAssistFeeFetch: 'decimal',
    surplusAssistFeeNow: 'decimal',
    agencyFee: 'decimal',
    agencyFeeRate: 'string',
    agencyFeeNoTax: 'decimal',
    surplusAgencyFee: 'decimal',
    realTax: 'decimal',
    serviceCost: 'decimal',
    goodsNameOne: 'string',
    waybillNo: 'string',
    orderGrossProfit: 'string',
    totalIn: 'decimal',
    blat: 'string',
    blon: 'string',
    elon: 'string',
    elat: 'string'
  },
};

// 地图电子围栏列表
const electronicFenceTable = {
  name: "electronic_fence",
  comment: "电子围栏表",
  attributes: {
    code: 'string',
    name: 'string',
    type: 'string',
    category: 'string',
    radius: 'decimal',
    size: 'decimal',
    address: 'string',
    remark: 'string',
    state: "integer",
    dispatchAreaCoordinates: 'json',

    longitude: 'decimal',
    latitude: 'decimal',
    // 更新人
    updateBy: "string",
    // 更新人id
    updateById: "integer",
    // 创建人
    createBy: "string",
    // 创建人id
    createById: "integer",

  }
}

const TABLES = {
  // 用户表
  // userTable,

  // 订单表
  // orderTable,

  electronicFenceTable
};

module.exports = TABLES;
