/*
 * @Author: Null
 * @Date: 2022-11-16 14:20:14
 * @Description: 单号生成方法
 */
exports.generateOrderNumber = (prefix = "No", length = 4) => {
  const format = (num) => (num > 9 ? num : "0" + num);
  const now = new Date();
  let year = now.getFullYear().toString();
  let month = format((now.getMonth() + 1).toString());
  let day = format(now.getDate().toString());
  let hour = format(now.getHours().toString());
  let minutes = format(now.getMinutes().toString());
  // 存放订单号
  let num = "";
  // N位随机数(加在时间戳后面)
  for (var i = 0; i < length; i++) {
    num += Math.floor(Math.random() * 10);
  }
  return prefix + year.slice(-2) + month + day + hour + minutes + num;
};
