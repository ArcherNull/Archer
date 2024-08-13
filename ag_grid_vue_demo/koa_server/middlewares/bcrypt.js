const bcrypt = require("bcrypt");
const { BCRYPT_SALT_NUM } = require("../config");

/**
 * @description: 密码加密
 * @param {*} password
 * @return {*}
 */
const encryptedPassword = (password) => {
  if (password) {
    const salt = bcrypt.genSaltSync(BCRYPT_SALT_NUM);
    // 对明文加密
    const encPassword = bcrypt.hashSync(password, salt);

    console.log("encPassword", encPassword);
    return encPassword;
  } else {
    return "";
  }
};

/**
 * @description: 验证密码是否一致
 * @param {*} password 密码明文
 * @param {*} encPassword 密码密文
 * @return {*}
 */
const validatePasswordIsTrue = (password, encPassword) => {
  if (password) {
    if (encPassword) {
      // 验证比对是否正确,返回布尔值表示验证结果 true表示一致，false表示不一致
      return bcrypt.compareSync(password, encPassword);
    } else {
      return false;
    }
  } else {
    return false;
  }
};

exports.encryptedPassword = encryptedPassword;
exports.validatePasswordIsTrue = validatePasswordIsTrue;
