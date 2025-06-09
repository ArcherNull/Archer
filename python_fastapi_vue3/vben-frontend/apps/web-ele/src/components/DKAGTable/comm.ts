import { defineComponent } from 'vue';

import {
  cloneDeep,
  isArray,
  isBoolean,
  isEmpty,
  isFunction,
  isObject,
} from 'lodash-es';

type ObejectType = { [key: string]: any };

// 自定义序号渲染器
export const NumberRenderer = {
  // 渲染函数，用于渲染单元格内容
  // params 包含了当前单元格的信息，如 rowIndex, value 等
  // parent 是父组件的 Vue 实例
  // pinned 是列的固定方向，可能的值有 'left' 和 'right'
  // column 是列的定义
  // value 是单元格的值
  // rowIndex 是行的索引
  // api 是 ag-Grid 提供的 API 接口
  // cellRendererParams 是传递给渲染器的参数
  // context 是 ag-Grid 的上下文对象
  // refresh 是一个函数，用于触发单元格的重新渲染
  // componentParent 是组件的父组件实例
  // eGridCell 是当前单元格的 DOM 元素
  // colDef 是列的定义
  // frameworkComponentInstance 是渲染器组件的实例
  // callback 是一个函数，用于通知 ag-Grid 渲染器准备就绪
  // detectChanges 是一个函数，用于触发变更检测
  // refreshFrameworkComponent 是一个函数，用于重新渲染组件
  // componentHolder 是组件容器
  // originalAfterGuiAttached 是组件的原始 afterGuiAttached 方法
  // guiValue 是组件的当前值
  // destroy 是一个函数，用于销毁渲染器组件
  // getGui 是获取渲染器的 DOM 元素的方法
  // agInit 是初始化渲染器的方法
  // afterGuiAttached 是组件挂载后的回调方法
  // getValue 是获取组件值的方法
  // destroy 是销毁组件的方法
  // hasFrameworkComponent 指示渲染器是否使用了框架组件
  // hasRefresh 指示渲染器是否需要刷新方法
  // useFrameworkComponent 指示是否使用框架组件
  // isPopup 指示渲染器是否是弹出类型
  // isCancelBeforeStart 指示是否在开始前取消
  // getFrameworkComponentInstance 获取框架组件实例的方法
  // getRenderedRowCount 获取渲染的行数的方法
  // agInit: (params) => {
  // 初始化序号为当前行的索引
  // params.value = params.rowIndex + 1;
  // },
  getGui: (params: any) => {
    // 创建一个简单的 div 元素来显示序号
    const eDiv = document.createElement('div');
    eDiv.innerText = params.value.toString();
    return eDiv;
  },
};

/**
 * @description: 获取序号列
 * @param {*} options
 * @return {*}
 */
export const getSerialNumberColumns = (options: any = {}) => {
  const cOptions = isNotEmptyObj(options)
    ? options
    : {
        checkboxSelection: false,
        headerCheckboxSelection: false,
        headerCheckboxSelectionFilteredOnly: false,
      };
  const defaultOptions = {
    checkboxSelection: false,
    filter: false,
    floatingFilter: false,
    headerCheckboxSelection: false,
    headerCheckboxSelectionFilteredOnly: false,
    headerName: '#',
    lockPosition: true,
    maxWidth: 200,
    pinned: 'left',

    sortable: false,
    valueGetter(params: any) {
      return params?.node?.rowIndex + 1 || null;
    },
    width: 90,
  };
  return Object.assign(defaultOptions, cOptions);
};

/**
 * @description: 获取操作列
 * @param {any} options
 * @return {*}
 */
export const getOperationColumns = (options: any = {}) => {
  const cOptions = isNotEmptyObj(options) ? options : { width: 100 };

  const defaultOptions = {
    cellRendererFramework: 'BtnList',
    field: 'operation',
    filter: false,
    floatingFilter: false,
    headerName: '操作',
    lockPosition: true,
    pinned: 'right', // 固定在左侧
    sortable: false,
  };
  return Object.assign(defaultOptions, cOptions);
};

/**
 * @description:
 * @return {*}
 */
export function getColumnDefs(options: any, slots?: any) {
  const { columnDefs, columns } = options;
  const { operation: operationEle, ...restSlots } = slots || {};

  // columnDefs优先级高于columns
  if (isNotEmptyArr(columnDefs)) {
    return {
      nClos: columnDefs,
    };
  } else {
    if (isNotEmptyArr(columns)) {
      const cColumns = cloneDeep(columns);

      let serialNumberColumns: any;
      let operationColumns: any;
      let autoGroupColumns: any;

      const recColumnsFun = (cArr: any[]): any[] => {
        return cArr.map((ele: any) => {
          const {
            _children,
            autoGroup,
            cellDataType,
            cellStyle,
            colSpan,
            editable,
            fixed,
            headerStyle,
            label,
            minWidth,
            prop,
            render,
            spanRows,
            type,
            width,
            ...restObj
          } = ele;
          const sectionTypeList = ['index', 'selection'];
          if (sectionTypeList.includes(type)) {
            if (!serialNumberColumns) {
              serialNumberColumns = getSerialNumberColumns();
            }

            if (type === 'selection') {
              serialNumberColumns.checkboxSelection = true;
              serialNumberColumns.headerCheckboxSelection = true;
              serialNumberColumns.headerCheckboxSelectionFilteredOnly = true;
            }
          }

          if (prop && label) {
            const dObj: ObejectType = {
              cellDataType,
              field: prop,
              headerName: label,
              minWidth,
              width,
              ...restObj,
            };
            if (label === '操作' && prop === 'operation') {
              operationColumns = getOperationColumns({
                cellStyle: {
                  alignItems: 'center',
                  display: 'flex',
                },
                minWidth,
                width,
              });
              if (operationEle) {
                operationColumns.cellRenderer = defineComponent((props) => {
                  const { data, node = {}, value } = props.params;
                  const rowIndex = node?.sourceRowIndex;
                  const filterRowIndex = node?.rowIndex;
                  const scope = {
                    $index: rowIndex,
                    filterRowIndex,
                    index: rowIndex,
                    row: data,
                    value,
                  };

                  return () => {
                    return operationEle(scope);
                  };
                });
              }
            } else {
              // 枚举类
              if (isNotEmptyArr(ele?.enum)) {
                const enumList = ele.enum;
                dObj.valueGetter = (params: any) => {
                  const { data } = params;
                  if (prop) {
                    const value = data[prop];
                    const findItem = enumList.find(
                      (cItem: ObejectType) => cItem.value === value,
                    );
                    return findItem?.label || value;
                  } else {
                    return null;
                  }
                };
              }

              // 兼容渲染, render 在jsx中体现，
              if (isFunction(render)) {
                /* 
                cellRenderer 有三种接收参数的方式
                1、使用 defineComponent / h 函数动态创建组件
                2、直接使用函数方式 (params) => { return `<span style="color:red;">${params.value}</span>` }
                3、先注册全局vue组件，例如 customerComponent, 再使用 cellRenderer:"customerComponent" ; 如果需要一些特定的参数，可以再加入cellRendererParams ， 例如cellRendererParams: { color: 'guinnessBlack' }
                */
                dObj.cellRenderer = defineComponent((props) => {
                  const { data, node = {}, value } = props.params;
                  const rowIndex = node?.sourceRowIndex;
                  const filterRowIndex = node?.rowIndex;
                  const Dom = render({
                    $index: rowIndex,
                    filterRowIndex,
                    index: rowIndex,
                    row: data,
                    value,
                  });

                  return () => {
                    return Dom;
                  };
                });
              }

              // 兼容渲染, slot  在template中体现，优先级高于render
              if (isNotEmptyObj(restSlots)) {
                const slotEle = restSlots[prop];
                if (slotEle) {
                  dObj.cellRenderer = defineComponent((props) => {
                    const { data, node = {}, value } = props.params;
                    const rowIndex = node?.sourceRowIndex;
                    const filterRowIndex = node?.rowIndex;
                    const scope = {
                      $index: rowIndex,
                      filterRowIndex,
                      index: rowIndex,
                      row: data,
                      value,
                    };

                    return () => {
                      return slotEle(scope);
                    };
                  });
                }
              }

              // 单元格是否可编辑
              if (editable) {
                dObj.editable = true;
                dObj.editComponent = 'el-input';
              }

              if (['left', 'right'].includes(fixed)) {
                dObj.pinned = fixed;
              }

              // 头部样式
              if (headerStyle) {
                if (isFunction(headerStyle)) {
                  dObj.headerStyle = headerStyle;
                } else {
                  const cHStyle = isNotEmptyObj(headerStyle) ? headerStyle : {};
                  dObj.headerStyle = Object.assign({}, cHStyle);
                }
              }

              // 单元格样式
              if (cellStyle) {
                if (isFunction(cellStyle)) {
                  dObj.cellStyle = cellStyle;
                } else {
                  const cCStyle = isNotEmptyObj(cellStyle) ? cellStyle : {};
                  dObj.cellStyle = Object.assign({}, cCStyle);
                }
              }

              // 列合并
              if (isFunction(colSpan)) {
                dObj.colSpan = colSpan;
              }

              // 行合并
              if (isBoolean(spanRows)) {
                dObj.spanRows = spanRows;
              }

              // 处理children
              if (isNotEmptyArr(_children)) {
                dObj.children = recColumnsFun(_children);
              }

              // 聚合
              if (autoGroup) {
                autoGroupColumns = cloneDeep(dObj);
              } else {
                // nColumnDefs.push(dObj);
                return dObj;
              }
            }
          }
        });
      };

      const nColumnDefs: any[] = recColumnsFun(cColumns);

      const nClos = [
        serialNumberColumns,
        ...nColumnDefs,
        operationColumns,
      ].filter(Boolean);

      console.log('nClos123123123', nClos);

      return {
        aClos: autoGroupColumns,
        nClos,
      };
    } else {
      console.error('参数【columnDefs】和【columns】不能为空数组');
      return {};
    }
  }
}

/**
 * @description: 校验是否是非空数组
 * @param {any} obj
 * @return {*}
 */
export function isNotEmptyArr(obj: any): boolean {
  return isArray(obj) && !isEmpty(obj);
}

/**
 * @description: 校验是否是非空对象
 * @param {any} obj
 * @return {*}
 */
export function isNotEmptyObj(obj: any): boolean {
  return isObject(obj) && !isEmpty(obj);
}
