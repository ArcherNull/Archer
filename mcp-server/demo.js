/*
 * @Author: Null 779217162@qq.com
 * @Date: 2025-10-08 14:28:58
 * @LastEditors: Null 779217162@qq.com
 * @LastEditTime: 2025-10-09 09:45:30
 * @FilePath: \Archer\mcp-server\demo.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

// 简单示例
const alertText = `MCP server running at port ${process.pid}`;
process.stdout.write(alertText);

// 监听输入的数据,并输出到控制台,data是二进制数据
process.stdin.on("data", (data) => {
  console.log("接受得到的数据=====>", data);
  console.log("接受得到的数据=====>", data.toString());
});


//stdin是进程的输入流,我们可以通过注册事件的方式来获取输入的内容
process.stdin.on('readable', function () {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    process.stdout.write('data: ' + chunk);
  }
});