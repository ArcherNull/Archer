/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-10-18 11:35:55
 * @LastEditTime: 2024-12-13 10:07:06
 * @Description: 公共方法
 */

/**
 * @description: 深拷贝
 * @param { object | array } source 被拷贝对象
 * @return {*}
 */
function deepClone(source) {
  if (!source && typeof source !== "object") {
    throw new Error("error arguments", "deepClone");
  }
  const targetObj = source.constructor === Array ? [] : {};
  Object.keys(source).forEach((keys) => {
    if (source[keys] && typeof source[keys] === "object") {
      targetObj[keys] = deepClone(source[keys]);
    } else {
      targetObj[keys] = source[keys];
    }
  });
  return targetObj;
}

/**
 * @description: 递归数组生成树数据
 * @param {any[]} tree
 * @param {{ maxLevel:number, defalutParentIdVal:any, id:string, parentId:string, children:string}} options
 * @return {*}
 */
function newFilterTreeData(tree, options) {
  const { maxLevel, defalutParentIdVal, id, parentId, children } = {
    // 树型数据最大深度, 至少为1
    maxLevel: options?.maxLevel || 2,
    // 初始的父级id值，用于开启递归
    defalutParentIdVal: options?.defalutParentIdVal,
    // 子键
    id: options?.id || "id",
    // 父键
    parentId: options?.parentId || "parentId",
    // 子集合键
    children: options?.children || "children",
  };

  const filterTreeData = (tree, pCode, level = 0) => {
    if (level > maxLevel) return;
    level++;
    // 第一级是平铺的多个根，手动过滤一下
    const stack = tree.filter((node) => node[parentId] === pCode);
    const newTree = [];

    while (stack.length > 0) {
      const node = stack.pop();
      if (node) {
        node[children] = filterTreeData(tree, node[id], level);
        newTree.push(node);
      }
    }

    return newTree;
  };
  return filterTreeData(tree, defalutParentIdVal);
}

/**
 * @description: 构造树型结构数据
 * @param {any[]} data
 * @param {string} id
 * @param {string} parentId
 * @param {string} children
 * @return {*}
 */
function handleTree(data = [], options = {}) {
  const config = {
    id: options?.id || "id",
    parentId: options?.parentId || "parentId",
    childrenList: options?.children || "children",
  };

  const childrenListMap = {};
  const nodeIds = {};
  const tree = [];

  for (const d of data) {
    const parentId = d[config.parentId];
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = [];
    }
    nodeIds[d[config.id]] = d;
    childrenListMap[parentId].push(d);
  }

  for (const d of data) {
    const parentId = d[config.parentId];
    if (nodeIds[parentId] == null) {
      tree.push(d);
    }
  }

  for (const t of tree) {
    adaptToChildrenList(t);
  }

  function adaptToChildrenList(o) {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]];
    }
    if (o[config.childrenList]) {
      for (const c of o[config.childrenList]) {
        adaptToChildrenList(c);
      }
    }
  }
  return tree;
}

/**
 * @description: 递归函数，只能针对小批量的数据进行递归处理，大数据会堆栈溢出
 * @param {*} list
 * @param {*} pCode
 * @return {*}
 */
function recursionFun(list, pCode = 0) {
  let len = list.length;
  function loop(pCode) {
    let res = [];
    for (let i = 0; i < len; i++) {
      let item = list[i];
      if (item.pCode === pCode) {
        item.children = loop(item.code);
        res.push(item);
      }
    }
    return res.length ? res : null;
  }
  return loop(pCode);
}

/**
 * @description: 迭代递归函数
 * @param {*} tree
 * @param {*} pCode
 * @param {*} level
 * @return {*}
 */
function filterTreeData(tree, pCode, level = 0) {
  if (level > 2) return;
  level++;
  // 第一级是平铺的多个根，手动过滤一下
  const stack = tree.filter((node) => node?.pCode === pCode);
  const newTree = [];

  while (stack.length > 0) {
    const node = stack.pop();
    if (node) {
      node.children = filterTreeData(tree, node.code, level);
      newTree.push(node);
    }
  }
  return newTree;
}

module.exports = {
  deepClone,
  newFilterTreeData,
  recursionFun,
  filterTreeData,
};
