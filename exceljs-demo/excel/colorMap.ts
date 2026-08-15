// 辅助函数：根据 6 位十六进制颜色返回适合的图标颜色（黑或白）
function getIconColorFromBg(hexColor: string): string {
  const hex = hexColor.replace("#", "");
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const y = (r * 299 + g * 587 + b * 114) / 1000;
  // 原阈值 128，现改为 150
  return y >= 150 ? "#000000" : "#ffffff";
}

// 颜色列表
export const allColorList: any[] = [
  ["G", { color: "#ABF09A", type: "row", text: "绿" }], // 绿
  ["LG", { color: "#D7FCCB", type: "row", text: "浅绿" }], // 浅绿
  ["MGT", { color: "#FF95BB", type: "row", text: "品红" }], // 品红
  ["LMGT", { color: "#FFADE3", type: "row", text: "浅品红" }], // 浅品红
  ["HR", { color: "#DB9494", type: "row", text: "灰红" }], // 灰红
  ["R", { color: "#FF9586", type: "row", text: "红" }], // 红
  ["LR", { color: "#FFD5D5", type: "row", text: "浅红" }], // 浅红
  ["Y", { color: "#FFED59", type: "row", text: "黄" }], // 黄
  ["LY", { color: "#FFFFCD", type: "row", text: "浅黄" }], // 浅黄
  ["B", { color: "#9AE2F0", type: "row", text: "蓝" }], // 蓝
  ["LB", { color: "#CBF4FC", type: "row", text: "浅蓝" }], // 浅蓝
  ["LP", { color: "#E3DAFF", type: "row", text: "浅紫" }], // 浅紫
  ["H", { color: "#E4E4E4", type: "row", text: "灰" }], // 灰
  ["W", { color: "#FFFFFF", type: "row", text: "白" }], // 白
  ["O", { color: "#F6AB00", type: "row", text: "德坤黄" }], // 德坤黄
  ["LO", { color: "#FACD66", type: "row", text: "德坤黄浅" }], // 德坤黄浅
  ["LLO", { color: "#FCE6B3", type: "row", text: "德坤黄浅浅" }], // 德坤黄浅浅
  ["LLLO", { color: "#FEF7E6", type: "row", text: "德坤黄浅浅浅" }], // 德坤黄浅浅浅
  ["BW", { color: "#FFE8C4", type: "row", text: "坤速达" }], // 坤速达
  ["P", { color: "#7573FF", type: "row", text: "紫点" }], // 紫点

  ["PR", { color: "#F75656", type: "cell", text: "红点" }], // 红点
  ["PO", { color: "#F5AD01", type: "cell", text: "橘点" }], // 橘点
  ["PY", { color: "#FFF100", type: "cell", text: "黄点" }], // 黄点
  ["PG", { color: "#00D115", type: "cell", text: "绿点" }], // 绿点
  ["PQ", { color: "#57EACA", type: "cell", text: "青点" }], // 青点
  ["PB", { color: "#008AFF", type: "cell", text: "蓝点" }], // 蓝点
  ["PP", { color: "#7573FF", type: "cell", text: "紫点" }], // 紫点
  ["PH", { color: "#555555", type: "cell", text: "灰点" }], // 灰点
  ["PLH", { color: "#AAAAAA", type: "cell", text: "浅灰点" }], // 浅灰点
];

// 背景色映射
export const colorFlagMap = new Map<string, string>(
  allColorList.map((item) => [item[0], item[1].color]),
);

// 图标颜色映射
export const colorFlagSelectMap = new Map<string, string>(
  allColorList.map((item) => [item[0], getIconColorFromBg(item[1].color)]),
);
