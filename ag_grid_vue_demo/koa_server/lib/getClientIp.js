
/**
 * @description: 获取客户端ip
 * @param {*} req
 * @return {*}
 */
exports.getClientIP = (req) => {
  return (
    req.headers["x-forwarded-for"] || // 判断是否有反向代理 IP
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress || // 判断 connection 的远程 IP
    req.socket.remoteAddress || // 判断后端的 socket 的 IP
    req.connection.socket.remoteAddress
  );
};

exports.parseIpToAddress = () => {
  // https://restapi.amap.com/v3/ip?ip=114.247.50.2&key=<用户的key>

//   axios
//     .get(url)
//     .then((res) => {})
//     .catch(() => {});

// 返回的数据类型
  /**
{
        "status": "1",
        "info": "OK",
        "infocode": "10000",
        "province": "北京市",
        "city": "北京市",
        "adcode": "110000",
        "rectangle": "116.0119343,39.66127144;116.7829835,40.2164962"
    }
 */
};
