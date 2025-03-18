/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2025-03-05 10:51:52
 * @LastEditTime: 2025-03-05 10:56:25
 * @Description: 任务队列类，配合视图div的IntersectionObserver使用
 */
import { isEmpty, isFunction, isObject } from 'lodash-es';

export function isNotEmptyObj(obj) {
  return isObject(obj) && !isEmpty(obj);
}

export class TaskListClass {
  _callback = null;
  _queue = [];
  _requestUrl = {};
  _taskList = [];

  constructor(options, callback) {
    console.log('option123123123s', options);
    const taskList = this.genereateTaskList(options);
    this._taskList.push(...taskList);
    if (callback && typeof callback === 'function') {
      this._callback = callback;
    }
  }

  // 实体添加回调函数
  addCallback(callback) {
    if (callback && typeof callback === 'function') {
      this._callback = callback;
    }
  }
  // 新增任务
  addTaskList(newTaskList = []) {
    const taskList = this.genereateTaskList(newTaskList);
    this._taskList.push(...taskList);
  }

  // 执行任务项
  async doRequestItem(taskTitle) {
    if (taskTitle) {
      const doTaskList = this._taskList.find((ele) => taskTitle === ele.title);
      for (let i = 0; i < doTaskList.resultList.length; i++) {
        const item = doTaskList.resultList[i];
        if (item.status !== 'done') {
          const isFun = isFunction(item?.requestItemFun);
          if (isFun) {
            try {
              item.status = 'doing';
              item.loading = true;
              const res = await item.requestItemFun();
              item.loading = false;
              if (res?.code === 200) {
                const resData = res?.data || {};
                item.status = 'done';
                item.result = resData;
              } else {
                item.status = 'fail';
                item.result = '请求失败';
              }
            } catch (error) {
              item.status = 'fail';
              item.result = `请求失败,${error}`;
            }
          } else {
            item.status = 'fail';
            item.result = '请求失败';
          }
        }
      }

      console.log('doTaskList=====>', doTaskList);
      this.taskProcessing(doTaskList, this._taskList);
      return doTaskList;
    } else {
      return [];
    }
  }

  // 生成真实的任务项列表
  genereateTaskList(options) {
    const { commParams, menuList, requestItemFun, requestUrl } = options;
    this._requestUrl = requestUrl;
    if (isFunction(requestItemFun)) {
      const newResList = menuList.map((task) => {
        const { domId, title } = task;
        const taskObj = {
          commParams: commParams || {},
          domId,
          resultList: [],
          title,
        };
        const urlList = requestUrl[title];

        if (urlList?.length) {
          taskObj.resultList = urlList.map((ele) => {
            if (ele.url) {
              const params = ele?.params || {};
              ele.params = params;
              ele.requestItemFun = requestItemFun(
                ele.url,
                Object.assign(params, commParams),
              );
              ele.status = 'waitting';
              ele.result = null;
            } else {
              ele.status = 'fail';
              ele.result = `【${title}-${ele?.title}】请求实例不为请求函数，无法请求`;
            }
            return ele;
          });
        }

        return taskObj;
      });
      return newResList;
    } else {
      throw new Error('参数【requestItemFun】请求方法不为函数');
    }
  }

  // 压栈
  pushQueue(taskTitle) {
    if (this.taskTitleList.includes(taskTitle)) {
      // 请求池去重，防止重复请求
      if (!this._queue.includes(taskTitle)) {
        this._queue.push(taskTitle);
      }
      return this;
    } else {
      throw new Error(`任务【${taskTitle}】未在requestUrl中注册`);
    }
  }

  // 循环执行任务
  async taskLoop() {
    // 循环请求池任务
    const result = [];
    while (this._queue.length > 0) {
      const taskTitle = this._queue.shift(); // 出列
      const res = await this.doRequestItem(taskTitle);
      result.push(res);
    }

    return result;
  }

  // 任务进程
  taskProcessing(taskItem, taskList) {
    if (typeof this._callback === 'function') {
      this._callback({
        task: taskItem,
        taskList,
      });
    }
  }

  get taskTitleList() {
    return Object.keys(this._requestUrl);
  }
}
