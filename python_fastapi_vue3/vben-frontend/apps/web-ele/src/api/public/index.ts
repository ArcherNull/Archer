import type { ResType } from '#/api/request';

import { requestClient } from '#/api/request';

/**
 * 上传OSS对象存储
 */
export async function uploadFile(data: FormData) {
  return requestClient.post<ResType.ResResult<any>>(
    `/upload/aliOss/upload`,
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}
