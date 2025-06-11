import type { ResType } from '#/api/request';

import { requestClient } from '#/api/request';

export namespace SystemFileCenterApi {
  export interface SystemDept {
    [key: string]: any;
    id: string;
    name: string;
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 获取导入列表
 */
export async function getImportCenterList(data: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        code: 200,
        msg: '',
        total: 3,
        result: [
          {
            searchValue: null,
            params: {},
            pageSize: null,
            pageNum: null,
            orderByColumn: null,
            isAsc: null,
            fieldSort: null,
            id: null,
            taskNo: 'f4f66bcf-3470-4dff-88bd-703c8b5cfd52',
            importDataType: 11,
            menuName: '货物时效配置-网点组织',
            status: '任务分发失败',
            originImportFileUrl: '',
            errorFileUrl: '',
            createdTime: '2025-03-04 14:51:10',
            startTime: '2025-03-04 14:51:10',
            endTime: null,
            fileName: '货物时效网点组织 (4).xlsx',
            totalRecord: 631,
            succeedRecord: 0,
            failRecord: 1,
            type: 1,
            modifiedTime: null,
            time: '160s',
            createUserId: null,
            createUserName: '超级管理员',
            fileSize: '20.51KB',
          },
          {
            searchValue: null,
            params: {},
            pageSize: null,
            pageNum: null,
            orderByColumn: null,
            isAsc: null,
            fieldSort: null,
            id: null,
            taskNo: '66de7f23-0c78-48f9-8be4-9289922decf4',
            importDataType: 11,
            menuName: '货物时效配置-网点组织',
            status: '任务分发失败',
            originImportFileUrl:
              'importAndExportDetails/importDetails/2025-03-04/货物时效网点组织 (4)@2025-03-04 14:50:14.xlsx',
            errorFileUrl: '',
            createdTime: '2025-03-04 14:50:15',
            startTime: '2025-03-04 14:50:15',
            endTime: null,
            fileName: '货物时效网点组织 (4).xlsx',
            totalRecord: 631,
            succeedRecord: 0,
            failRecord: 1,
            type: 1,
            modifiedTime: null,
            time: null,
            createUserId: null,
            createUserName: '超级管理员',
            fileSize: '20.51KB',
          },
          {
            searchValue: null,
            params: {},
            pageSize: null,
            pageNum: null,
            orderByColumn: null,
            isAsc: null,
            fieldSort: null,
            id: null,
            taskNo: '74251603-2602-4286-a243-4a76271f9c20',
            importDataType: 21,
            menuName: '发车统计配置-线路组织修正',
            status: '部分成功',
            originImportFileUrl:
              'importAndExportDetails/importDetails/2025-03-01/发车统计配置-线路组织修正导出@2025-03-01 15_33_14@2025-03-01 17:51:49.xlsx',
            errorFileUrl:
              'importAndExportDetails/errorDetails/2025-03-01/发车统计配置-线路组织修正导出@2025-03-01 15_33_14_error@2025-03-01 17:51:50.xlsx',
            createdTime: '2025-03-01 17:51:50',
            startTime: '2025-03-01 17:51:50',
            endTime: '2025-03-01 17:51:51',
            fileName: '发车统计配置-线路组织修正导出@2025-03-01 15_33_14.xlsx',
            totalRecord: 197,
            succeedRecord: 149,
            failRecord: 48,
            type: 1,
            modifiedTime: null,
            time: '100s',
            createUserId: null,
            createUserName: '管理员',
            fileSize: '15.40KB',
          },
        ],

        pageNum: 1,
        pageSize: 10,
      });
    }, 1000);
  });
}

/**
 * 导出excel文件
 */
export async function exportFile(params: any) {
  return requestClient.get<ResType.ResResult<any>>(`/taskImportCenter/export`, {
    params,
  });
}
/**
 * 打出类型
 */
export async function queryFileSource() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        code: 200,
        msg: '操作成功',
        data: [
          {
            menu_name: '集团收入指标',
            type: 2,
          },
          {
            menu_name: 'KPS外发成本财务数据管理报表',
            type: 2,
          },
          {
            menu_name: '业绩看板导出',
            type: 2,
          },
        ],
      });
    }, 500);
  });
}

/**
 * 新增导入
 */
export async function addImportCenter(data: any) {
  return requestClient.post<ResType.ResResult<any>>(
    '/taskImportCenter/add',
    data,
  );
}

/**
 * 修改导入
 */
export async function editImportCenter(data: any) {
  return requestClient.put<ResType.ResResult<any>>(
    '/taskImportCenter/edit',
    data,
  );
}

/**
 * 删除导入
 */
export async function deleteImportCenter(ids: number | string) {
  return requestClient.delete<any>(`/taskImportCenter/${ids}`);
}

/**
 * 导入excel文件
 */
export async function importFile(data: FormData, fileType: 1 | 2) {
  return requestClient.post<ResType.ResResult<any>>(
    `/taskImportCenter/import?fileType=${fileType}`,
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

/**
 * 通过相对路径获取绝对路径
 */
export function getAPathByRPath(params: any) {
  return requestClient.get<ResType.ResResult<any>>(
    `/upload/aliOss/generateUrl`,
    {
      params,
    },
  );
}
