import { CusMath } from "./cusMath.js";
const cusMath = new CusMath();

// 总运费计算处理计算精度问题
function calcTotalFreight(subOrderObj) {
  const pObj = {
    deliveryFee: { name: "送货费", switchField: "" },
    shipingFeeTotal: { name: "基本运费", switchField: "" },
    collectionGoodsFee: { name: "代收货款", switchField: "beCollection" },
    collectionProceduresFee: { name: "手续费", switchField: "" },
    // declareValue: { name: "保险", switchField: "beInsurance" },
    guaranteedFee: { name: "保价费", switchField: "" },
    discountFee: { name: "折扣折让费", switchField: "" },
    waitDeliveryFee: { name: "控货费", switchField: "beControl" },
    rateFee: { name: "发票费", switchField: "beticketing" },
    entryFee: { name: "进仓费", switchField: "beWarehouse" },
    packingFee: { name: "包装费", switchField: "bePacking" },
    woodenFrameFee: { name: "木架费", switchField: "beWoodenFrame" },
    customsFee: { name: "报关费", switchField: "beCustoms" },
    loadingUnloadingFee: { name: "装卸费", switchField: "beLoading" },
    sortingFee: { name: "分拣费", switchField: "beSorting" },
    receiptFee: { name: "回单费", switchField: "" },
    commissionFee: { name: "佣金金额", switchField: "" },
  };

  const nObj = {};

  let calcExpressionList = [];
  let calcExpressionNameList = [];

  Object.entries(pObj).forEach((ele) => {
    const [key, obj] = ele;
    const name = obj?.name;
    const switchField = obj?.switchField;
    const fVal = subOrderObj[key];
    let val = cusMath.convertNumber(fVal);

    nObj[key] = val;

    // 费用开关，当费用存在则开启，不存在则关闭
    if (switchField) {
      // 因为存在两个单独的开关 ， 控货 / 进仓 ，当开关关闭时，需要将费用清0
      if (["beControl", "beWarehouse"].includes(switchField)) {
        const sNum = subOrderObj[switchField];
        if (val > 0) {
          if (sNum == 0) {
            subOrderObj[key] = 0;
            val = 0;
          }
        }
      } else {
        subOrderObj[switchField] = val > 0 ? "1" : "0";
      }
    }

    if (val > 0) {
      calcExpressionList.push(val);
      calcExpressionNameList.push(`${name}${val}`);
    }
  });

  let totalShipFee = 0;
  if (calcExpressionList.length) {
    const expressionStr = calcExpressionList.join("+");
    const expressionNameStr = calcExpressionNameList.join("+");
    totalShipFee = cusMath.expression(expressionStr).end();
    console.log("表达式======>", `${expressionNameStr}=总运费${totalShipFee}`);
  }

  return subOrderObj;
}

// 总台结算-计算结算成本
function calcClosingCosts(resData) {
  // 正常费用字段
  const feeFielddsObj = {
    settleDepartureFee: "结算始发操作费",
    settleMainLineFee: "结算干线费",
    settleTerminalFee: "结算终端操作费",
    settleDepartureAllocationFee: "结算始发分拨费",
    settleTerminalAllocationFee: "结算终端分拨费",
    settleTransitFee: "结算中转费",
    settleDeliveryFee: "结算送货费",
    settleUpStairFee: "结算上楼费",
    settleReceiptFee: "结算回单费",
    settleControlFee: "结算控货费",
    settleCollectionlFee: "结算代收货款费",
    settleGuaranteedFee: "结算保价费",
    settlePackingFee: "结算包装费",
    settleWoodenFrameFee: "结算代打木架费",
    settleLoadingUnloadingFee: "结算装卸费",
    ForkliftFee_C: "结算叉车费",
    settleEntryFee: "结算进仓费",
    WarehouseFee_C: "结算仓储费",
    settleCustomsFee: "结算报关费",
    settleWorkBookFee: "结算工本费",
    settleRateFe: "结算税率",
    settleFuelFee: "结算燃油费",
    settleIndormationFee: "结算信息费",
    changeOrderFee: "改单费",
    settleOtherFee: "结算其他费",
    settleSpecialAreaFee: "结算特殊区域服务费",
    settleSortingFee: "结算分拣费",
    settleShippingFee: "结算出货费",
    settlePiecesFee: "结算计件费",
    settleLabelFee: "结算标签费",
  };

  const nObj = {};

  let calcExpressionList = [];
  let calcExpressionNameList = [];

  const otherFields = [
    "settleMainLineFee",
    "settleTransitFee",
    "settleDeliveryFee",
    "settleDepartureFee",
    "settleTerminalFee",
  ];
  let calcOtherExpressionList = [];
  let calcOtherExpressionNameList = [];

  Object.entries(feeFielddsObj).forEach((ele) => {
    const [key, name] = ele;
    const fVal = resData[key];
    const val = cusMath.convertNumber(fVal);
    nObj[key] = val;
    if (val !== 0) {
      calcExpressionList.push(val);
      calcExpressionNameList.push(`${name}${val}`);
      if (otherFields.includes(key)) {
        calcOtherExpressionList.push(val);
        calcOtherExpressionNameList.push(`${name}${val}`);
      }
    }
  });

  let cTotal = 0;
  if (calcExpressionList.length) {
    const expressionStr = calcExpressionList.join("+");
    const expressionNameStr = calcExpressionNameList.join("+");
    cTotal = cusMath.expression(expressionStr).end();
    console.log(
      "中台结算-结算成本表达式======>",
      `${expressionNameStr}=结算成本${cTotal}`
    );
  } else {
    console.log("中台结算-结算成本表达式======>", `结算成本${cTotal}`);
  }

  // 其它费合计计算 = 结算成本  - (干线费 + 中转费 + 送货费 + 始发操作费 + 终端操作费)
  if (calcOtherExpressionList.length) {
    const expressionStr =
      `${cTotal}-` + `(${calcOtherExpressionList.join("+")})`;
    const expressionNameStr =
      `结算成本${cTotal}-` + `(${calcOtherExpressionNameList.join("+")})`;
    cTotal = cusMath.expression(expressionStr).end();
    console.log(
      "中台结算-其它费合计计算表达式======>",
      `${expressionNameStr}=其它费合计${cTotal}`
    );
  } else {
    console.log(
      "中台结算-其它费合计计算表达式======>",
      `结算成本${cTotal}=其它费合计${cTotal}`
    );
  }
  //   console.log("nObj=====>", nObj);
  getCostPriceTotal(resData, cTotal, nObj);
}

// 获取成本底价费用合计
function getCostPriceTotal(resData, otherExpenses, nObj) {
  // 成本费用字段
  const costFielddsObj = {
    settleMainLineCostFee: "结算干线费成本",
    settleDeliveryCostFee: "结算送货费成本",
    settleTransitCostFee: "结算中转费成本",
    settleDepartureCostFee: "结算始发操作费成本",
    settleTerminalCostFee: "结算终端操作费成本",
  };

  let calcCostExpressionList = [];
  let calcCostExpressionNameList = [];
  Object.entries(costFielddsObj).forEach((ele) => {
    const [key, name] = ele;
    const fVal = resData[key];
    const val = cusMath.convertNumber(fVal);
    nObj[key] = val;
    if (val !== 0) {
      calcCostExpressionList.push(val);
      calcCostExpressionNameList.push(`${name}${val}`);
    }
  });

  // 成本底价合计
  let costTotal = 0;
  calcCostExpressionList.push(otherExpenses);
  calcCostExpressionNameList.push("其它费合计");
  if (calcCostExpressionList.length) {
    const expressionStr = calcCostExpressionList.join("+");
    const expressionNameStr = calcCostExpressionNameList.join("+");
    costTotal = cusMath.expression(expressionStr).end();
    console.log(
      "中台结算-成本底价合计计算表达式======>",
      `${expressionNameStr}=成本底价合计${costTotal}`
    );
  } else {
    console.log(
      "中台结算-成本底价合计计算表达式======>",
      `成本底价合计${costTotal}`
    );
  }
}

const resData = {
  settleDepartureFee: 3,
  settleMainLineFee: 90,
  settleTerminalFee: 7,
  settleDepartureAllocationFee: 0,
  settleTerminalAllocationFee: 0,
  settleTransitFee: 0,
  settleDeliveryFee: 80,
  settleUpStairFee: 0,
  settleReceiptFee: 0,
  settleControlFee: 0,
  settleCollectionlFee: 0,
  settleGuaranteedFee: 1,
  settlePackingFee: 0,
  settleWoodenFrameFee: 0,
  settleLoadingUnloadingFee: 0,
  ForkliftFee_C: 0,
  settleEntryFee: 0,
  WarehouseFee_C: 0,
  settleCustomsFee: 0,
  settleWorkBookFee: 0,
  settleRateFe: 0,
  settleFuelFee: 0,
  settleIndormationFee: 0,
  changeOrderFee: 0,
  settleOtherFee: 0,
  settleSpecialAreaFee: 0,
  settleSortingFee: 0,
  settleShippingFee: 0,
  settlePiecesFee: 0,
  settleLabelFee: 0,
  settleMainLineCostFee: 90,
  settleDeliveryCostFee: 80,
  settleTransitCostFee: 0,
  settleDepartureCostFee: 3,
  settleTerminalCostFee: 7,
};

const obj = {
  deliveryFee: 200,
  shipingFeeTotal: 1000,
  collectionGoodsFee: 2.89,
  collectionProceduresFee: 23.09,
  guaranteedFee: 24.98,
  discountFee: 1.34,
  waitDeliveryFee: 0,
  rateFee: 0,
  entryFee: 0,
  packingFee: 0,
  woodenFrameFee: 0,
  customsFee: 0,
  loadingUnloadingFee: 0,
  sortingFee: 0,
  receiptFee: 0.12,
  commissionFee: 23.23,
  receiptRequirement: "签回单",
  elevator: "上楼",
};

// 测试方法
export function testFun() {
  calcClosingCosts(resData);
  calcTotalFreight(obj);
}
