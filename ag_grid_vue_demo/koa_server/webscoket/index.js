/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-27 14:32:25
 * @LastEditTime: 2023-08-02 09:28:38
 * @Description: ws封装
 *
 * 参考文档：http://www.npmdoc.org/wszhongwenwendangws-jszhongwenjiaochengjiexi.html#server-broadcast
 *
 */
const WebSocket = require("ws");
// const { WS_CONFIG } = require("../config");

exports.createWsServer = function (port) {
  if (port) {
    const server = new WebSocket.Server({ port });

    server.on("open", function open() {
      console.log("connected");
    });

    server.on("close", function close() {
      console.log("disconnected");
    });

    server.on("connection", function connection(ws, req) {
      const ip = req.socket.remoteAddress;
      const port = req.socket.remotePort;
      const clientName = ip + port;

      console.log("%s is connected ", clientName);

      ws.send("Welcome " + clientName);

      ws.on("message", function incoming(message) {
        console.log("received: %s from %s", message, clientName);
        server.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(clientName + " -> " + message);
          }
        });
      });
    });
    console.log(`wsServer创建，请访问ws://127.0.0.1:${port}`)
  } else {
    console.log("缺少ws端口号，请检查");
  }
};
