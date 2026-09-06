import type { Dayjs } from "dayjs";

import type {
  MultipleHeaderExcelExportOptions,
  NewExcelSheetDefaults,
} from "./export";
import type { ColumnStyleFn, RowStyleFn } from "./index";

import dayjs from "dayjs";
import { isFunction, isObject, isEmpty } from "lodash-es";

import { colorFlagMap } from "./colorMap";

/**
 * @description: 校验是否是非空对象
 * @param {any} obj
 * @return {*}
 */
export function isNotEmptyObj(obj: any): boolean {
  return isObject(obj) && !isEmpty(obj);
}

/** 将 #RRGGBB 转为 Excel 用的 ARGB（带 FF 前缀） */
function toExcelArgb(hexColor: string | undefined): string | undefined {
  if (typeof hexColor !== "string" || !hexColor) return undefined;
  const rgb = hexColor.split("#")[1];
  if (!rgb) return undefined;
  return `FF${rgb}`;
}

/**
 * 合并普通对象 bgObj 与 colorFlagMap 的键，统一做 ARGB 转换。
 * 同一 key 优先使用 bgObj 中的颜色（便于覆盖默认表）。
 */
export function getBgColorList(
  bgObj?: Record<string, string>,
): Record<string, string> {
  const extra: Record<string, string> = isNotEmptyObj(bgObj)
    ? (bgObj as Record<string, string>)
    : {};
  const allKeys = new Set<string>([
    ...colorFlagMap.keys(),
    ...Object.keys(extra),
  ]);
  const bgColorListObj: Record<string, string> = {};
  for (const key of allKeys) {
    const hex = extra[key] ?? colorFlagMap.get(key);
    const argb = toExcelArgb(hex);
    if (argb) {
      bgColorListObj[key] = argb;
    }
  }
  return bgColorListObj;
}

// 空值
const emptyArr = new Set([
  "",
  -Infinity,
  Infinity,
  null,
  Number.NaN,
  undefined,
]);

type ResetOptionsType = {
  bgColorList?: Record<string, string>;
  getDefaultCStyle?: ColumnStyleFn;
  getDefaultRStyle?: RowStyleFn;
  isCol?: boolean;
  isRow?: boolean;
  rowColorField?: string;
};

// 默认的sheet选项
export const defaultSheetOptions: NewExcelSheetDefaults = {
  defaultColumnWidth: 20,
  defaultRowHeight: 18,
  enableFilter: true,
  headerStyle: {
    fill: {
      /** 填充模式 */
      type: "pattern",
      /** 填充模式 */
      pattern: "solid",
      /** 填充颜色 */
      fgColor: { argb: "FFE6F3FF" }, // FFE6F3FF  FFFFF100
      /** 背景颜色 */
      // bgColor: { argb: 'FFE6F3FF' },
    },
  },
  dataCellStyle: {
    alignment: {
      /** 垂直居中 */
      vertical: "middle",
      /** 水平居中 */
      horizontal: "center",
      /** 自动换行，当内容超出单元格宽度时，自动换行 */
      // wrapText: true,
      /** 缩进，当内容超出单元格宽度时，自动缩进 */
      // indent: 1,
      /** 自动适应宽度，当内容超出单元格宽度时，自动适应宽度，会缩放字体，但不会自动换行 */
      // shrinkToFit: true,
      /** 文本旋转，当内容超出单元格宽度时，自动旋转，90度 */
      // textRotation: 90,
    },
    // font: {
    //   /** 字体大小 */
    //   size: 12,
    //   /** 字体颜色 */
    //   color: { argb: 'FF000000' },
    // },
    // border: {
    //   /** 边框样式 */
    //   style: 'thin',
    //   /** 边框颜色 */
    //   color: { argb: 'FF000000' },
    // },
  },
};

// 获取合并的sheet选项，用于兼容以前版本的前端导出， sheetOptions 优先级高于 resetOptions
export function getMergeSheetOptions(
  sheetOptions: MultipleHeaderExcelExportOptions["sheetOptions"],
  resetOptions: ResetOptionsType = {},
): MultipleHeaderExcelExportOptions["sheetOptions"] {
  const {
    rowColorField = "colorFlag",
    isRow = true,
    isCol = false,
    bgColorList = {},
    getDefaultRStyle,
    getDefaultCStyle,
    ...restExtraOptions
  } = resetOptions;
  const mergeBgColorList = getBgColorList(bgColorList);

  // 拼装默认的行样式
  const defaultRStyle: RowStyleFn = ({ row }) => {
    const colorVal = (row as Record<string, unknown>)[rowColorField];
    if (
      colorVal &&
      typeof colorVal === "string" &&
      !emptyArr.has(colorVal as string)
    ) {
      const color = mergeBgColorList[colorVal as string];
      if (color && !emptyArr.has(color)) {
        return {
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: color },
            // bgColor: { argb: color },
          },
        };
      }
    }
  };

  // 拼装默认的列样式
  const defaultCStyle: ColumnStyleFn = ({ field, value }) => {
    if (
      field === rowColorField &&
      typeof value === "string" &&
      !emptyArr.has(value)
    ) {
      const color = mergeBgColorList[value];
      if (color && !emptyArr.has(color)) {
        return {
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: color },
            // bgColor: { argb: color },
          },
        };
      }
    }
  };

  const mergeDefaultRStyle = isFunction(getDefaultRStyle)
    ? getDefaultRStyle
    : defaultRStyle;

  const mergeDefaultCStyle = isFunction(getDefaultCStyle)
    ? getDefaultCStyle
    : defaultCStyle;

  const newOptions = Object.assign(
    defaultSheetOptions,
    {
      rowStyle: isRow ? mergeDefaultRStyle : undefined,
      columnStyle: isCol ? mergeDefaultCStyle : undefined,
    },
    restExtraOptions,
    sheetOptions,
  );

  return newOptions;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Excel 日期整数部分（序列日）。
 * 基准：1900-01-01 = 1；对 1900-02-28 之后的日期按 Excel 闰年 bug 做 +1 修正。
 */
function getExcelDateSerial(date: Date): number {
  const start = new Date(Date.UTC(1899, 11, 30));
  const diffDays = Math.floor((date.getTime() - start.getTime()) / MS_PER_DAY);
  return diffDays + (diffDays >= 61 ? 1 : 0);
}

/** 一天 = 1，故 12:00 约为 0.5（按 UTC 时分秒毫秒折算） */
function getExcelTimeSerial(date: Date): number {
  const totalSecs =
    date.getUTCHours() * 3600 +
    date.getUTCMinutes() * 60 +
    date.getUTCSeconds() +
    date.getUTCMilliseconds() / 1000;
  return totalSecs / (24 * 3600);
}

/** `dateToExcelSerial` 支持的入参（常见为时间字符串或毫秒时间戳） */
export type DateToExcelSerialInput = Date | Dayjs | number | string;

/**
 * 将时间转为 Excel 日期时间序列数（浮点数），用于写入数值单元格并配合 `numFmt`（如 `yyyy-mm-dd hh:mm:ss`）。
 * 使用 dayjs 解析入参（时间字符串、毫秒时间戳、`Date`、`Dayjs` 等）；序列算法与参考一致：整日部分为 UTC 日差 + Excel bug 修正，小数为 UTC 钟面时间占比。
 * 无效或空值返回 `NaN`。
 */
export function dateToExcelSerial(input: DateToExcelSerialInput): number {
  if (input === null || input === undefined) {
    return Number.NaN;
  }
  if (typeof input === "number" && !Number.isFinite(input)) {
    return Number.NaN;
  }
  if (typeof input === "string" && input.trim() === "") {
    return Number.NaN;
  }
  const parsed = dayjs(input);
  if (!parsed.isValid()) {
    return Number.NaN;
  }
  const date = parsed.toDate();
  return getExcelDateSerial(date) + getExcelTimeSerial(date);
}
