/*
 * @Author: Null 779217162@qq.com
 * @Date: 2025-10-08 14:28:58
 * @LastEditors: Null 779217162@qq.com
 * @LastEditTime: 2025-10-08 16:41:39
 * @FilePath: \Archer\mcp-server\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

const alertText = `MCP server running at port ${process.pid}`;
process.stdout.write(alertText);
process.stdin.on("data", (data) => {
  console.log("接受得到的数据=====>", data);
});
