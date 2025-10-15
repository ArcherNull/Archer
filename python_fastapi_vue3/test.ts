import ws from "@/utils/socket/socket"

const wsEx = new ws({ baseUrl:"ws://127.0.0.1:9898",header:["token"] });

// 建立连接
const name = wsEx.connect({ name: "xwya", url: "/api/system/webws/xwya" })

// 检测数据
wsEx.addCheckMessage(name,(msg) => {
    console.log(msg);
})
// 关闭
wsEx.close( name)

// 发送数据
w1.send(name,msg)

