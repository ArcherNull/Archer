/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-08-31 16:59:45
 * @LastEditTime: 2024-07-16 19:17:12
 * @Description:
 *
 * 参考文档： https://www.codetd.com/article/15481030
 *
 */
const http = require("http");
const url = require("url");

const PORT = 9000;
const orderJson = require("./order.json");

const getPostData = (req, callback) => {
  // post传参获取字符串方式一
  let postData = "";
  // 通过流传递数据，stream
  req.on("data", (chunk) => {
    postData += chunk.toString();
  });

  // 监听传输结束
  req.on("end", () => {
    console.log("postData", postData);
    callback(postData);
  });

  // post传参获取字符串方式二
  // let buffers = [];
  // req.on("data", (chunk) => {
  //   buffers.push(chunk);
  // });
  // req.on("end", function () {
  //   let data = Buffer.concat(buffers).toString();
  //   res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
  //   res.end(data);
  //   callback(data);
  // });
};

// 等分数组
function spliceArrByNum(arr, num) {
  let newArr = [...arr]; // 因为splice会改变原数组，要深拷贝一下
  let list = [];
  for (let i = 0; i < newArr.length; i++) {
    list.push(newArr.splice(i, num));
  }
  return list;
}

// 迭代器
function* walk(data) {
  if (data.length && Array.isArray(data)) {
    const newList = spliceArrByNum(data, 5);
    for (let item of newList) {
      yield JSON.stringify(item);
    }
  } else {
    return [];
  }
}

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  console.log("query", query);
  const method = req.method;

  // post请求
  if (/post|options/i.test(method)) {
    // 可跨域
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "X-Token,Content-Type",
      "Access-Control-Allow-Methods": "PUT",
      "Content-Type": "text/html;charset=utf-8",
    });
    if (pathname === "/order/list") {
      // 获取所有数据
      getPostData(req, (bodyData) => {
        console.log("获取请求头提交的post参数", typeof bodyData);
        res.end(JSON.stringify(orderJson));
      });
    } else if (pathname === "/order/step") {
      // 分步骤所有数据
      if (orderJson.length) {
        const iterator = walk(orderJson);
        // 定时输出
        let timerId;
        timerId = setInterval(() => {
          const { value, done } = iterator.next();
          if (done) {
            clearInterval(timerId);
          }
          console.log("/order/step发送片段=====>");
          if (value) {
            res.write(JSON.stringify(value));
          } else {
            res.end("请求终止");
          }
        }, 1000);
      } else {
        res.end("");
      }
    } else if (pathname === "/order/page") {
      // 通过分页传参获取数据
      const page = Number(query.page) || 1;
      const pageSize = Number(query.pageSize) || 10;

      console.log("page =====>", page);
      console.log("pageSize =====>", pageSize);

      const resultArr = spliceArrByNum(orderJson, pageSize);

      setTimeout(() => {
        res.end(
          JSON.stringify({
            code: 200,
            data: resultArr[page - 1] || [],
            message: "请求成功",
            total: orderJson.length,
            currentPage: Number(page),
            currentPageSize: Number(pageSize),
          })
        );
      }, 500);
    } else {
      res.end("Not Found");
    }
  }

  // get请求
  if (/get/i.test(method)) {
    if (url === "/file") {
      let postData = getPostData(req);
      console.log("获取请求头提交的post参数", postData);
    } else if (url === "/test") {
      res.end("测试成功");
    } else {
      res.end("Not Found");
    }
  }
});

server.listen(PORT, () => {
  console.log(`server run at http://localhost:${PORT}`);
});

// 监听服务器错误
server.on("error", (e) => {
  console.log("监听服务器错误", e);
});

// 调用server.close()可以触发下方监听
server.on("close", () => {
  console.log("服务关闭啦");
});

server.setTimeout(60 * 1000 * 1000, () => {
  console.log("响应超时");
});

// 超时相应监听
server.on("timeout", function () {
  console.log("连接已经超时");
});
