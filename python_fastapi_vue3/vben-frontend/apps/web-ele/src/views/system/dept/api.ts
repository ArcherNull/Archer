import mockData from './mockData.json';

export function getDepartmentTree() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData);
    }, 1000);
  });
}

export function deleteDepartment(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: id,
        msg: '操作成功',
      });
    }, 1000);
  });
}

export function addDepartment() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: null,
        msg: '操作成功',
      });
    }, 1000);
  });
}

export function editDepartment() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: null,
        msg: '操作成功',
      });
    }, 1000);
  });
}
