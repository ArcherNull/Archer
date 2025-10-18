/**
 * @description: 处理类似于【10~0方】【10.25~20吨】【50方】【20吨】的数据
 * @param {*} str 处理的字符串
 * @return {*} [ 10, 20 ] / [ 10 ] / 错误提示字符串
 */
function dealStrConvertArr(str) {
    if (str) {
        if (/[\d{*}~\d{*}|\d{*}][方|吨]$/.test(str)) {
            const newStr = str.replace(/[方|吨]$/, "");
            const splitArr = newStr.split("~");

            if (splitArr.length) {
                const errLog = [];
                const [num1, num2] = splitArr;

                const convertNum = (str = 0) => {
                    const val = Number(str);
                    return isNaN(val) ? errLog.push(`${str}不为数字`) && 0 : val;
                };

                const val1 = convertNum(num1);
                const val2 = convertNum(num2);

                if (val1 > 0) {
                    if (num2 !== undefined) {
                        if (val2 > 0) {
                            if (val2 < val1) {
                                errLog.push(`起始值[${val2}]不能大于等于截止值[${val1}]`);
                            }
                        } else {
                            errLog.push(`截止值不能小于等于0`);
                        }
                    }
                } else {
                    errLog.push(`起始值值不能小于等于0`);
                }

                if (!errLog.length) {
                    return val2 ? [val1, val2] : [val1];
                } else {
                    return errLog[0];
                }
            } else {
                return "【重量/体积】不满足【XXX吨/XXX方】格式，请联系管理员";
            }
        } else {
            return "【重量/体积】不满足【XXX吨/XXX方】格式，请联系管理员";
        }
    } else {
        return []
    }
}

/**
 * @description: 小数点后三位校验
 * @param {输入金额值}  value
 * @return {输入0.213，例如输出0.21}
 */
function keepNumDecimal(value, accuracy = 3) {
    var percentage
    let regStr = accuracy == 3 ? /^(\d?)+(\.\d{0,3})?$/ : /^(\d?)+(\.\d{0,2})?$/
    if (regStr.test(value)) {
        percentage = value;
    } else {
        percentage = value.substring(0, value.length - 1);
    }
    return percentage
}

/**
 * @description: 数字转换
 * @param {*} num
 * @return {*}
 */
function convertNumber(num) {
    const val = Number(num);
    return isNaN(val) ? 0 : val;
}

/**
 * @description: 保留小数点后三位，最后第四位还存在小数点的，四舍五入
 * @param {*} num 数值
 * @param {*} accuracy 精度
 * @param {*} type  roundUp 向上取整， roundDown 向下取整， round 四舍五入
 * @return {*}
 */
function NumberRoundUp(num, type = "round", accuracy) {
    const numVal = convertNumber(num);
    if (numVal) {
        const accuracyVal = Math.pow(10, convertNumber(accuracy) || 3);
        const newVal = numVal * accuracyVal;
        // 如果精度是3，则下方是对第四位小数进行操作的
        if (type === "roundUp") {
            return Math.ceil(newVal) / accuracyVal;
        } else if (type === "roundDown") {
            return Math.floor(newVal) / accuracyVal;
        } else {
            return Math.round(newVal) / accuracyVal;
        }
    } else {
        return 0;
    }
}

/**
 * @description: 检测是否时百分比字符串
 * @param {*} str
 * @return {*}
 */
function isPercentage(str) {
    return /^(\-|\+)?\d+(|(\.\d+)|\d+)%$/.test(str);
}

/**
 * @description: 将百分比字符串转义为数字
 * @param {*} str
 * @return {*}
 */
function convertPercentageToNum(str) {
    if (isPercentage(str)) {
        const num = convertNumber(str.replace("%", ""));
        return NumberRoundUp(num / 100);
    } else {
        return 0;
    }
}

/**
 * @description: 数字字符串转百分比,number//保留几位
 * @param {*} str
 * @return {*}
 */
function convertNumToPercentage(str, number = 2) {
    if (str) {
        if (/^(\-|\+)?\d+(\.\d+)?$/.test(String(str))) {
            const num = convertNumber(str);
            return `${NumberRoundUp(num * 100).toFixed(number)}%`;
        } else {
            return `0%`;
        }
    } else {
        return `0%`;
    }
}

module.exports = {
    dealStrConvertArr,
    convertNumber,
    NumberRoundUp,
    isPercentage,
    convertPercentageToNum,
    convertNumToPercentage,
    keepNumDecimal
}