/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-03 20:52:44
 * @LastEditTime: 2024-07-08 16:52:53
 * @Description: 参数校验文件
 */

const moment = require("moment");
const { DEFAULT_DATE_FORMAT } = require("../config");


// 是否是邮箱
exports.isMail = function (mail, text = "邮箱") {
  if (mail) {
    const reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    if (reg.test(mail)) {
      return true;
    } else {
      return `参数【${text}】不符合邮箱格式`;
    }
  } else {
    return `参数【${text}】不能为空`;
  }
};

// 是否是qq
exports.isQQ = function (qq, text = "qq") {
  if (qq) {
    if (/^[1-9][0-9]{4,10}$/.test(qq)) {
      return true;
    } else {
      return `参数【${text}】不符合qq格式`;
    }
  } else {
    return `参数【${text}】不能为空`;
  }
};

// 是否是身份证号
exports.isIDCard = function (idCard, text = "身份证号") {
  if (idCard) {
    if (/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard)) {
      return true;
    } else {
      return `参数【${text}】不符合身份证格式`;
    }
  } else {
    return `参数【${text}】不能为空`;
  }
};

// 密码强度校验
exports.isPassword = function (password, text = "密码") {
  if (password) {
    // /(?=.{6,17})(?=.*\d)(?=.*[a-z])[\x20-\x7f]*/i.test(password)
    if (password?.length >= 4) {
      return true;
    } else {
      return `参数【${text}】不符合密码强度校验格式`;
    }
  } else {
    return `参数【${text}】不能为空`;
  }
};

// 验证码校验
exports.isVerifyCode = function (verifyCode, text = "验证码") {
  if (verifyCode) {
    // /(?=.{6,17})(?=.*\d)(?=.*[a-z])[\x20-\x7f]*/i.test(password)
    if (verifyCode?.length === 6) {
      return true;
    } else {
      return `参数【${text}】长度应为6`;
    }
  } else {
    return `参数【${text}】不能为空`;
  }
};

// 是否是链接形式
exports.isUrl = function (url, text = "链接") {
  if (url) {
    const reg =
      /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    if (reg.test(url)) {
      return true;
    } else {
      return `参数【${text}】不符合链接格式`;
    }
  } else {
    return `参数【${text}】不能为空`;
  }
};

// 是否是手机号
exports.isPhoneNumber = function (phoneNumber, text = "手机号") {
  if (phoneNumber) {
    if (/(^$)|^1\d{10}$/.test(phoneNumber)) {
      return true;
    } else {
      return `参数【${text}】不符合手机号格式`;
    }
  } else {
    return `参数【${text}】不能为空`;
  }
};

// 判断是否是正整数
exports.isPositiveInteger = function (num, text = "正整数") {
  if (num) {
    if (/^[1-9]\d*$/.test(num)) {
      return true;
    } else {
      return `参数【${text}】不是正整数`;
    }
  } else {
    return `参数【${text}】不能为空`;
  }
};

// 判断是否是中文名
exports.isChineseName = function (name) {
  let regStr = /[\u4E00-\u9FFF]+$/g;
  let regEn = /[a-zA-z0-9]/im;
  let regSpecStr = /\s+/g;

  if (regEn.test(name)) {
    return "不能含有英文和数字";
  } else if (regSpecStr.test(name)) {
    return "不能含有空格";
  } else if (regStr.test(name)) {
    if (name.length >= 2 || name.length <= 5) {
      return true;
    } else {
      return "中文名长度在2-5之间";
    }
  }
};

// 判断账号名是否符合格式
exports.isUserName = function (userName) {
  if (userName) {
    if (userName.length < 2) {
      return "用户名称长度不能小于2";
    } else {
      return true;
    }
  } else {
    return "用户名称是必填项";
  }
};

// 判断计划名是否符合格式
exports.isValidatedName = function (name) {
  if (name) {
    if (name.length < 2) {
      return "计划名称长度不能小于2";
    } else {
      return true;
    }
  } else {
    return "计划名称是必填项";
  }
};

// 空值校验
exports.isNoEmpty = function (value, text = null) {
  if (value) {
    return true;
  } else {
    return text ? `参数【${text}】不能为空` : "参数不能为空";
  }
};

// 性别校验
exports.isSex = function (value) {
  const sexList = [0, 1];
  if (sexList.indexOf(value) !== -1) {
    return true;
  } else {
    return "性别参数缺失";
  }
};

// 是否是日期
exports.isDate = function (dateStr, text = null, dateFormat = DEFAULT_DATE_FORMAT) {
  if (dateStr) {
    const dateVal = moment(dateStr, dateFormat, true);
    console.log('dateVal.isValid()', dateVal.isValid())
    return dateVal.isValid() ? true : `参数【${text}】不符合日期格式`;
  } else {
    return `参数【${text}】日期字符串为空`;
  }
};

// 是否是IPV4
exports.isIPV4 = function (str, text = 'IP') {
  if (str) {
    const regStr = /^((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(?::(?:[0-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$/
    if (regStr.test(str)) {
      return true;
    } else {
      return `参数【${text}】不符合IPV4格式`;
    }
  } else {
    return `参数【${text}】不能为空`;
  }
}

