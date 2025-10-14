const dataProcessor = {
  prefix: 'Result:',
  process: function(value) {
    console.log(`${this.prefix} ${value}`);
  }
};

// 模拟异步操作
function fetchData(callback) {
  setTimeout(() => {
    callback(100); // 回调函数执行时，this 可能指向全局对象
  }, 1000);
}

// 绑定 process 方法的 this 为 dataProcessor
fetchData(dataProcessor.process.bind(dataProcessor)); 
// 1秒后输出：Result: 100
