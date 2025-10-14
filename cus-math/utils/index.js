
// 单例模式辅助方法，实现真正的单例
function singletonPattern(classname) {
  let instance = null;
  const proxy = new Proxy(classname, {
    construct(target, args) {
      if (!instance) {
        instance = Reflect.construct(target, args);
      }
      return instance;
    },
  });
  proxy.prototype.constructor = proxy;
  return proxy;
}
