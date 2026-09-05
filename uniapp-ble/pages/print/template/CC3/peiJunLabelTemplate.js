/**
 * CPCL 配军标签模板
 * 对应 Archer buildTemplate6（优博讯 K319 / CPCL + GBK）
 * 业务数据字段与 Common.getJCLabelTemplate 同源
 */

// ─── 文本工具 ───────────────────────────────────────────

function truncate(str, maxLen) {
	if (!str) return "";
	const s = String(str);
	if (s.length <= maxLen) return s;
	return s.slice(0, Math.max(1, maxLen - 1)) + "…";
}

/** 按字符数换行，超出 maxLines 时末行截断 */
function wrapText(str, maxLen, maxLines = 2) {
	if (!str) return [""];
	const s = String(str);
	const lines = [];
	let rest = s;
	while (rest.length > 0 && lines.length < maxLines) {
		if (rest.length <= maxLen) {
			lines.push(rest);
			break;
		}
		lines.push(rest.slice(0, maxLen));
		rest = rest.slice(maxLen);
	}
	if (rest.length > 0 && lines.length === maxLines) {
		lines[maxLines - 1] = truncate(lines[maxLines - 1], maxLen);
	}
	return lines.length ? lines : [""];
}

/** 输出多行 T 指令 */
function textLines(x, startY, lineGap, lines, font = "0 24") {
	return lines
		.map((line, i) => `T ${font} ${x} ${startY + i * lineGap} ${line}`)
		.join("\n");
}

const limitValList = [undefined, "", null];

function createGetVal(json) {
	return (field) => {
		if (!field) return "";
		const val = json[field];
		return limitValList.includes(val) ? "" : val;
	};
}

// ─── 布局常量（对齐 Archer template6） ─────────────────

const PAGE_W = 576;
// 收/寄两区等高（各 130），外框底随之下移
const Y_RECV_TOP = 360;
const Y_SEND_TOP = 490; // 360 + 130
const Y_BOX_BOTTOM = 620; // 490 + 130
const PAGE_H = 780;
const LINE_W = 3;
const BODY_GAP = 28;
const SMALL_GAP = 26;

/** Logo EG（与 Common / template6 相同） */
const LOGO_EG =
	"EG 8 58 10 2 0000000000000000000000000000000000000000000000000000003F00000000000000FFC0000000000001FFE0000000000003FFF0000000000007FFF800000000000FFFFC00000000001FFFFE00000000003FFFFF00000000007FFFFF8000000000FFFFFFC000000000FFF3FFC0000000007FE1FF80000000003FC0FF000000000C3F807F0C0000001C4F003C9E0000003F8600187F0000007F8000007F800000FFC00000FFC00001FFE00001FFE00003FFE00001FFF00007FFC00000FFF8000FFF8000007FFC000FFF0000003FFC001FFE0000001FFE001FFC0000000FFE001FF800000007FE001FF800000007FE001FFC0000000FFE001FFE0000001FFE000FFF0000003FFC000FFF8000007FFC0007FFC00000FFF80003FFE00001FFF00001FFE00001FFE00000FFC00000FFC000007F8000007F8000003F8600187F0000001E4F003C9E0000000C3F807F0C000000003FC0FF00000000007FE1FF8000000000FFF3FFC000000000FFFFFFC0000000007FFFFF80000000003FFFFF00000000001FFFFE00000000000FFFFC000000000007FFF8000000000003FFF0000000000001FFE0000000000000FFC00000000000003F00000000000000000000000000000000000000000000000000000000";

// ─── 空默认值（生产打印用） ───────────────────────────

const peiJunLabelEmptyData = {
	orderNo: "",
	transportType: "",
	transferHub: "",
	destArea: "",
	destOutlet: "",
	qrcode: "",
	goodsName: "",
	goodsQty: "",
	packType: "",
	weightVolume: "",
	receiverName: "",
	receiverPhone: "",
	receiverAddress: "",
	deliveryType: "",
	payType: "",
	senderAddress: "",
	senderName: "",
	senderPhone: "",
	valueAdded: "增值服务：",
	customerCode: "客户单号：",
	footerOutlet: "",
	printDate: "",
	promiseTime: "兑现时间：",
};

/** [#市#]-[#区#] */
function buildCityDistrict(getVal) {
	const city =
		getVal("city") ||
		getVal("receiveCity") ||
		getVal("destinationCity") ||
		getVal("receivedCity");
	const district =
		getVal("district") ||
		getVal("receiveDistrict") ||
		getVal("receiveArea") ||
		getVal("destinationDistrict") ||
		getVal("receivedDistrict");
	if (city && district) return `${city}-${district}`;
	if (city) return city;
	if (district) return district;
	// 兼容目的站 / 短码网点等既有字段
	const fallback =
		getVal("desitiantionSataion") ||
		getVal("shortNetworkDestination") ||
		"";
	return fallback;
}

/** 计费重量：优先 settleWeight，否则 weight/volume */
function buildWeightVolume(getVal) {
	const settle = getVal("settleWeight") || getVal("billingWeight");
	const vol = getVal("volume") || getVal("billingVolumn") || getVal("volumn");
	if (settle !== "") {
		return vol !== "" ? `${settle} KG / ${vol} F` : `${settle} KG`;
	}
	const weight = getVal("weight");
	const w = weight !== "" ? `${weight} KG` : "";
	const v = vol !== "" ? `${vol} F` : "";
	if (w && v) return `${w} / ${v}`;
	return w || v || "";
}

/** 增值服务：专有字段优先，否则按进仓/装卸/上楼拼接 */
function buildValueAdded(getVal) {
	const direct =
		getVal("valueAddedServices") ||
		getVal("addedService") ||
		getVal("valueAdded");
	if (direct) {
		return String(direct).includes("增值服务")
			? String(direct)
			: `增值服务：${direct}`;
	}
	const parts = [];
	if (getVal("beWarehouse") == "1") parts.push("进仓");
	if (getVal("beLoading") == "1") parts.push("装卸");
	if (getVal("isUpfloor")) parts.push(getVal("isUpfloor"));
	// 无增值服务时仍展示文案
	return parts.length ? `增值服务：${parts.join("")}` : "";
}

/** 收件地址：路由街道 + 详细地址 */
function buildReceiverAddress(getVal) {
	const route =
		getVal("routeAddress") || getVal("receiveStreet") || "";
	const detail = getVal("receivedAddress") || "";
	return [route, detail].filter(Boolean).join("");
}

/**
 * 业务数据（getJCLabelTemplate 同源）拼装为配军标签字段
 * @param {Object} biz appletWayBillCodeInfoVO + currentCopyCode
 */
export function mapBizToPeiJunLabel(biz = {}) {
	const getVal = createGetVal(biz || {});
	const code = getVal("code");
	const copy = getVal("currentCopyCode");
	const orderNo = copy !== "" ? `${code}-${copy}` : code;
	const qty = getVal("quantity");
	const goodsQty = qty !== "" ? (String(qty).includes("件") ? String(qty) : `${qty}件`) : "";
	const lastArrived = getVal("lastArrivedTime");
	const customerCodeVal = getVal("customerCode");

	return {
		orderNo,
		transportType: getVal("transitMode") || getVal("transportMode"),
		transferHub: getVal("transitStationName"),
		destArea: buildCityDistrict(getVal),
		destOutlet: getVal("labelName"),
		// destOutlet:  getVal("destinationPoint"),
		qrcode: code
			? `http://tms.dekuncn.com:9011/#/home?customerCode=${code}`
			: "",
		goodsName: getVal("itemNames"),
		goodsQty,
		packType: getVal("packUnits"),
		weightVolume: buildWeightVolume(getVal),
		receiverName:
			getVal("receivedManMasked") || getVal("receivedMan"),
		receiverPhone:
			getVal("receivedManPhoneMasked") ||
			getVal("receivedManPhone"),
		receiverAddress: buildReceiverAddress(getVal),
		deliveryType: getVal("handoverMode"),
		payType: getVal("paymentMethod"),
		senderAddress: getVal("shipCompany") || getVal("shipAddress"),
		senderName: getVal("shipManMasked") || getVal("shipMan"),
		senderPhone:
			getVal("shipManPhoneMasked") || getVal("shipManPhone"),
		valueAdded: buildValueAdded(getVal),
		customerCode: customerCodeVal
			? `${customerCodeVal}`
			: "",
		// footerOutlet: getVal("startPoint"),
		footerOutlet: getVal("orderLabelName"),
		printDate: getVal("orderDate"),
		// 无兑现时间时仍展示文案
		promiseTime: lastArrived ? `兑现时间：${lastArrived}` : "兑现时间：",
	};
}

/**
 * 业务数据直接生成配军标签 CPCL（调用方最少改动入口）
 * @param {Object} biz 与 getJCLabelTemplate 相同的打印数据
 */
export function buildPeiJunLabelTemplate(biz = {}) {
	console.log("buildPeiJunLabelTemplate", biz);
	return peiJunLabelTemplateJson(mapBizToPeiJunLabel(biz));
}

/** @deprecated 兼容旧命名 */
export function getPeiJunLabelTemplate(data) {
	return buildPeiJunLabelTemplate(data);
}

// ─── 模板构建（Archer buildTemplate6） ─────────────────

/**
 * 构建配军标签 CPCL
 * @param {Object} params 已映射的打印字段
 */
export function peiJunLabelTemplateJson(params = {}) {
	const d = { ...peiJunLabelEmptyData, ...params };

	const destAreaLines = wrapText(d.destArea, 10, 3);
	const destOutletLines = wrapText(d.destOutlet, 10, 3);
	const receiverAddrLines = wrapText(d.receiverAddress, 10, 2);
	const senderAddrLines = wrapText(d.senderAddress, 10, 2);
	const deliveryLines = wrapText(d.deliveryType, 6, 3);
	const payTypeLines = wrapText(d.payType, 6, 2);
	const valueAddedLines = wrapText(d.valueAdded, 7, 3);
	const customerCodeLines = wrapText(d.customerCode, 12, 2);

	const orderNo = String(d.orderNo || "");
	const qrContent = d.qrcode

	const lines = [];

	// ── 页头 ──
	lines.push(`! 0 200 200 ${PAGE_H} 1`);
	lines.push(`PAGE-WIDTH ${PAGE_W}`);
	lines.push(LOGO_EG);
	lines.push(`B 128 2 1 50 82 5 ${orderNo}`);
	// 条码下运单号：字号对齐 Common.getJCLabelTemplate（SETMAG 2 2 + TEXT 3 0）
	lines.push("SETMAG 2 2");
	lines.push("SETBOLD 1");
	lines.push(`T 3 0 182 60 ${orderNo}`);
	lines.push("SETBOLD 0");
	lines.push("SETMAG 1 1");
	lines.push(`VB 128 2 1 50 510 ${Y_BOX_BOTTOM} ${orderNo}`);
	lines.push(`BOX 5 100 500 ${Y_BOX_BOTTOM} ${LINE_W}`);

	// ── 运输方式 / 中转 ──
	lines.push("SETMAG 2 2");
	lines.push(`T 0 24 20 115 ${d.transportType}`);
	lines.push("SETBOLD 1");
	lines.push(`T 0 24 280 115 ${d.transferHub}`);
	lines.push("SETBOLD 0");
	lines.push("SETMAG 1 1");

	// ── 目的地区 / 网点（加粗，超 10 换行）──
	let yDest = 175;
	lines.push("SETBOLD 1");
	lines.push(textLines(15, yDest, BODY_GAP, destAreaLines));
	yDest += destAreaLines.length * BODY_GAP;
	const yOutlet = Math.max(yDest + 4, 220);
	lines.push(textLines(15, yOutlet, BODY_GAP, destOutletLines));
	lines.push("SETBOLD 0");

	// ── 二维码 ──
	lines.push("B QR 336 169 M 4 U 4");
	lines.push(`MA,${qrContent}`);
	lines.push("ENDQR");

	// ── 货物 ──
	lines.push(`T 0 24 20 285 ${d.goodsName}`);
	lines.push(`T 0 24 130 285 ${d.goodsQty}`);
	lines.push(`T 0 24 230 285 ${d.packType}`);
	lines.push("SETMAG 1 1");
	lines.push(`T 0 24 20 330 ${d.weightVolume}`);

	// ── 收件区：姓名 → 电话 → 地址（最多两行）──
	lines.push("SETMAG 2 2");
	lines.push("T 0 24 15 380 收");
	lines.push("SETMAG 1 1");
	let yRecv = 375;
	lines.push(`T 0 24 70 ${yRecv} ${d.receiverName}`);
	yRecv += BODY_GAP;
	lines.push(`T 0 24 70 ${yRecv} ${d.receiverPhone}`);
	yRecv += BODY_GAP;
	lines.push(textLines(70, yRecv, BODY_GAP, receiverAddrLines));

	// ── 送货方式 / 付款：小一号加粗，超 6 换行 ──
	lines.push("SETBOLD 1");
	lines.push("SETMAG 1 1");
	let yDelivery = 375;
	lines.push(textLines(340, yDelivery, SMALL_GAP, deliveryLines));
	yDelivery += deliveryLines.length * SMALL_GAP + 8;
	lines.push(textLines(340, yDelivery, SMALL_GAP, payTypeLines));
	lines.push("SETBOLD 0");

	// ── 寄件区：与收件区同序、同高 — 姓名 → 电话 → 地址 ──
	const ySendLabel = Y_SEND_TOP + 20;
	const ySendContent = Y_SEND_TOP + 15;
	lines.push("SETMAG 2 2");
	lines.push(`T 0 24 15 ${ySendLabel} 寄`);
	lines.push("SETMAG 1 1");
	let ySend = ySendContent;
	lines.push(`T 0 24 70 ${ySend} ${d.senderName}`);
	ySend += BODY_GAP;
	lines.push(`T 0 24 70 ${ySend} ${d.senderPhone}`);
	ySend += BODY_GAP;
	lines.push(textLines(70, ySend, BODY_GAP, senderAddrLines));

	// ── 增值服务：无值也保留「增值服务：」文案 ──
	lines.push(textLines(328, ySendContent, SMALL_GAP, valueAddedLines));
	// ── 客户单号：紧挨增值服务下方 ──
	const yCustomerCode =
		ySendContent + valueAddedLines.length * SMALL_GAP;
	lines.push(textLines(328, yCustomerCode, SMALL_GAP, customerCodeLines));

	// ── 分隔线 ──
	lines.push(`L 5 160 500 160 ${LINE_W}`);
	lines.push(`L 5 270 325 270 ${LINE_W}`);
	lines.push(`L 5 315 325 315 ${LINE_W}`);
	lines.push(`L 325 315 500 315 ${LINE_W}`);
	lines.push(`L 5 ${Y_RECV_TOP} 500 ${Y_RECV_TOP} ${LINE_W}`);
	lines.push(`L 5 ${Y_SEND_TOP} 500 ${Y_SEND_TOP} ${LINE_W}`);
	lines.push(`L 250 100 250 160 ${LINE_W}`);
	lines.push(`L 325 160 325 315 ${LINE_W}`);
	lines.push(`L 320 ${Y_RECV_TOP} 320 ${Y_BOX_BOTTOM} ${LINE_W}`);

	// ── 页脚 ──
	const yFooter1 = Y_BOX_BOTTOM + 15;
	const yFooter2 = Y_BOX_BOTTOM + 40;
	lines.push(`T 0 24 5 ${yFooter1} ${d.footerOutlet}`);
	lines.push(`T 0 24 320 ${yFooter1} ${d.printDate}`);
	lines.push(`T 0 24 5 ${yFooter2} ${d.promiseTime}`);
	lines.push("GAP-SENSE");
	lines.push("FORM");
	lines.push("PRINT");

	return lines.join("\n") + "\n";
}
