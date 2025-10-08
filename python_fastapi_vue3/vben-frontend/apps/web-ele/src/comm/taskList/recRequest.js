// 需求:
// 一个界面有20个不同url请求，
// 不能全部一次性请求，并发数可定义，限制在3个，每个请求的入参不一样，并且每个请求的返参也不相同；
// 并实时返回结果，当错误时，重新请求，重新请求次数不超过2次

// 单个请求
// const requestItem = (params) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         code: 200,
//         data: [],
//         msg: '请求成功',
//         params,
//       });
//     }, 2500);
//   });
// };

// 并发请求类
export class RecRequestClass {
  // 并发数
  _currencyNum = 3;
  // 默认并发数
  _defaultCurrencyNum = 3;
  // 执行下标响应结果
  _doResult = null;
  // 请求列表
  _requestList = [];

  constructor(options) {
    const { cNum, rList } = options || {};
    this._requestList = rList;
    this._currencyNum = cNum || this._defaultCurrencyNum;

    // 发布订阅模式
    this.eventMap = new Map();
    this.eventMap.set('tick', new Set([]));
  }

  // 执行循环请求
  doLoopRequest(requestPromise) {
    const that = this;
    return new Promise((resolve, reject) => {
      if (requestPromise && requestPromise instanceof Promise) {
        let index = 0; // 下一个发送请求的下标
        let count = 0; // 当前请求完成数量
        const results = [];
        const reqList = that._requestList;
        async function request() {
          // 如果当前请求下标超出reqList的长度则返回
          if (index === reqList.length) {
            return;
          }
          // 记录本次请求的下标
          const i = index;
          // 更新index
          index++;

          try {
            // 当前请求的url
            const reqParams = reqList[i] || {};
            console.log('reqParams', reqParams);
            const resp = await requestPromise(reqParams);
            that._doResult = resp;
            results[i] = resp;
            that.emit('tick');
          } catch (error) {
            console.error('throw error', error);
          } finally {
            count++;
            if (count === reqList.length) {
              console.log('抛出结果', results);
              resolve(results);
            } else {
              request();
            }
          }
        }

        const times = Math.min(this._currencyNum, reqList.length);
        for (let i = 0; i < times; i++) {
          request();
        }
      } else {
        reject(new Error('requestPromise参数需为http请求函数'));
      }
    });
  }

  // 执行单个请求
  doSingleRequest() {}

  emit(event) {
    this.eventMap.get(event).forEach((h) => {
      h.call(this, this);
    });
  }

  off(event, handler) {
    this.eventMap.get(event).delete(handler);
  }

  on(event, handler) {
    this.eventMap.get(event).add(handler);
  }
}

// function main() {
//   const requestList = Array.from({ length: 10 })
//     .fill('')
//     .map((_, ind) => {
//       return {
//         ind,
//       };
//     });
//   console.log('执行开始', requestList);
//   const recRequest = new RecRequestClass({
//     cNum: 3,
//     rList: requestList,
//   });

//   recRequest.doLoopRequest();

//   recRequest.on('tick', (data) => {
//     console.log('请求结果=====>', data);
//   });
// }

// main();
