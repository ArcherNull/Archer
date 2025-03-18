import { ElNotification } from 'element-plus';

/**
 * @description: 文件 相对路径转绝对路径
 * @param {string} rPath
 * @return {*} 绝对路径
 */
export const generateAUrl = (rPath: string): string => {
  const ossDomain = import.meta.env.VITE_OSS_DOMAIN;
  console.log('ossDomain', ossDomain);
  return `${ossDomain}/${rPath}`;
};

/**
 * @description: 通过a标签下载文件 【格式转换，也考虑过使用a标签直接转换后缀名，但是可能会造成文件损坏】
 * @param {string} url 文件链接
 * @param {string} fileName 文件名称
 * @param {string} url 文件后缀名
 * @return {*}
 */
export function downLoadByATag(
  url: string,
  fileName: string = 'downLoad',
  extname: string = '.png',
) {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${fileName}${extname}`); // 自定义下载文件名（如exemple.txt）
  document.body.append(link);
  link.click();
  window.URL.revokeObjectURL(link.href); // 释放url
  link.remove(); // 清除残留的文档片段<a></a>
}

/**
 * @description 接收数据流生成 blob，创建链接，下载文件
 * @param {Function} api 导出表格的api方法 (必传)
 * @param {string} tempName 导出的文件名 (必传)
 * @param {object} params 导出的参数 (默认{})
 * @param {boolean} isNotify 是否有导出消息提示 (默认为 true)
 * @param {string} fileType 导出的文件格式 (默认为.xlsx)
 */
export const useDownload = async (
  api: (param: any) => Promise<any>,
  tempName: string,
  params: any = {},
  isNotify: boolean = true,
  fileType: string = '.xlsx',
) => {
  if (isNotify) {
    ElNotification({
      duration: 3000,
      message: '如果数据庞大会导致下载缓慢哦，请您耐心等待！',
      title: '温馨提示',
      type: 'info',
    });
  }
  try {
    const res = await api(params);
    const blob = new Blob([res]);
    // 兼容 edge 不支持 createObjectURL 方法
    if ('msSaveOrOpenBlob' in navigator)
      return window.navigator?.msSaveOrOpenBlob(blob, tempName + fileType);
    const blobUrl = window.URL.createObjectURL(blob);
    const exportFile = document.createElement('a');
    exportFile.style.display = 'none';
    exportFile.download = `${tempName}${fileType}`;
    exportFile.href = blobUrl;
    document.body.append(exportFile);
    exportFile.click();
    // 去除下载对 url 的影响
    exportFile.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error(error);
  }
};
