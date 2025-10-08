const alertText = `MCP server running at port ${process.pid}`;
process.stdout.write(alertText);
process.stdin.on("data", (data) => {
  console.log("接受得到的数据=====>", data);
});
