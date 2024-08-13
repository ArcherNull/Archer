/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-06-04 13:59:24
 * @LastEditTime: 2024-06-04 14:40:43
 * @Description: 使用indexDB， 对于大批数据量处理，如果要针对ag-grid表格数据处理，最好是只读，不可操作，否则跟数据库中的数据保持不了一致
 *
 * 如果需要在web worker中使用indexDB ， 需要将实例化好的db在主线程中当成入参传递给web worker线程
 */

class CustomerIndexDB {
  // 数据库名称
  static DB_NAME = "balc-db";
  // 版本号
  static VERSION = 1;
  // 表名称
  _tableName = "h5";

  // 主键
  name;
  // 请求
  request;
  // 数据库
  db;
  constructor(name) {
    this.name = name;
  }

  init() {
    return new Promise((resolve, reject) => {
      this.request = window.indexedDB.open(
        CustomerIndexDB.DB_NAME,
        CustomerIndexDB.VERSION
      );
      this.request.onerror = (event) => {
        reject(event);
        console.error("缓存获取失败");
      };
      this.request.onsuccess = (event) => {
        resolve(event.target.result);
        this.db = event.target.result;
      };
      this.request.onupgradeneeded = (event) => {
        this.db = event.target.result;
        let objectStore;
        if (!this.db.objectStoreNames.contains(this._tableName)) {
          objectStore = this.db.createObjectStore(this._tableName, {
            keyPath: "name",
            unique: true, // 名称作为主键不允许重复
          });
          objectStore.createIndex("content", "content", { unique: false });
        }
      };
    });
  }

  // 读值
  async get(name) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this._tableName], "readonly");
      const objectStore = transaction.objectStore(this._tableName);
      const req = objectStore.get(name);

      req.onsuccess = function () {
        resolve(req.result);
      };
      req.onerror = reject;
    });
  }

  // 新增值
  async add(content) {
    return new Promise((resolve, reject) => {
      const select = this.db
        .transaction([this._tableName], "readwrite")
        .objectStore(this._tableName)
        .add({ name: this.name, content });

      select.onsuccess = (event) => {
        resolve(event.target.result);
      };
      select.onerror = reject;
    });
  }

  // 更新值
  async update(name, content) {
    return new Promise((resolve, reject) => {
      const select = this.db
        .transaction([this._tableName], "readwrite")
        .objectStore(this._tableName)
        .put({ name, content });

      select.onsuccess = (event) => {
        resolve(event.target.result);
      };
      select.onerror = reject;
    });
  }
}

export default CustomerIndexDB;
