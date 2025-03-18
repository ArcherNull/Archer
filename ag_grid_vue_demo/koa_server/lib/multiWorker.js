/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-09-15 14:53:31
 * @LastEditTime: 2023-09-15 14:53:56
 * @Description: 测试多进程
 */
var cluster = require("cluster");
var os = require("os");

// nodeJs中的主线程主要用于线程资源分配

// 是否是主线程
if (cluster.isMaster) {
  var numWorkers = os.cpus().length;
  console.log("Master cluster setting up " + numWorkers + " workers...");
  for (var i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  // 监听进程在线状态
  cluster.on("online", function (worker) {
    console.log("Worker " + worker.process.pid + " is online");
  });

  // 监听进程离线状态
  cluster.on("exit", function (worker, code, signal) {
    console.log(
      "Worker " +
        worker.process.pid +
        " died with code: " +
        code +
        ", and signal: " +
        signal
    );
    console.log("Starting a new worker");
    // 如果离线则重启work
    cluster.fork();
  });
}

setTimeout(() => {
  console.log("cluster.workers", cluster.workers);
}, 2500);

// 关闭所有worker进程
function restartWorkers() {
  var wid,
    workerIds = [];
  for (wid in cluster.workers) {
    workerIds.push(wid);
  }
  workerIds.forEach(function (wid) {
    cluster.workers[wid].send({
      text: "shutdown",
      from: "master",
    });
    setTimeout(function () {
      if (cluster.workers[wid]) {
        cluster.workers[wid].kill("SIGKILL");
      }
    }, 5000);
  });
}


setTimeout(() => {
  restartWorkers()
}, 12500);