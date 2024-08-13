/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-07-06 20:12:59
 * @LastEditTime: 2024-07-25 09:55:41
 * @Description:
 */
const path = require("path");
const {
  createReadStream,
  createWriteStream,
  createDir,
  unlinkFile,
  isFileExisted,
  fs,
} = require("../middlewares/fs");
const moment = require("moment");
const {
  UPLOAD_FILE_STORE_EXTNAME_LIST,
  UPLOAD_FILE_STORE_ROOT_PATH,
  ASSETS_ROOT_PATH,
  KOA_BODY_CONFIG,
} = require("../config");

const { SuccessModel, ErrorModel } = require("../exceptions/index");

/**
 * @description: 根据后缀名获取文件分类
 * @param {*} extName 文件后缀名
 * 
 * // img: png , jpg , jpeg , gif 
   // excel:  xlsx ,  csv , xls
   // doc: docx
   // video: mp4 
   // voice : mp3
   // ppt : pptx
 * 
 * @return {*}
 */
const getFileClassify = (extName) => {
  if (extName) {
    const listObjArr = Object.entries(UPLOAD_FILE_STORE_EXTNAME_LIST);
    const findItem = listObjArr.find(
      (item) => item[1]?.indexOf(extName) !== -1
    );

    if (findItem) {
      console.log("findItem", findItem);
      const uploadDir = path.join(
        __dirname,
        "../",
        ASSETS_ROOT_PATH,
        UPLOAD_FILE_STORE_ROOT_PATH
      );
      console.log("uploadDir", uploadDir);

      return {
        extName,
        fileClassify: findItem[0],
        fileClassifyExtNames: findItem[1],
      };
    } else {
      console.log("getFileClassify方法，未匹配到相应的文件后缀名");
      return false;
    }
  } else {
    console.log("getFileClassify方法，文件后缀名不存在");
    return false;
  }
};

/**
 * @description: 将上传得到的文件重新
 * @param {*} file 文件对象
 * @param {*} isDeleteOriginFile 是否删除源文件
 * @return {*}
 */
function storeUploadFileByClassify(file, isDeleteOriginFile = true) {
  return new Promise(async (resolve, reject) => {
    const { originalFilename, filepath } = file;
    if (originalFilename) {
      if (filepath) {
        try {
          const { ext, name } = path.parse(originalFilename);
          const fileClassifyObj = getFileClassify(ext);
          if (fileClassifyObj) {
            // 创建可读流
            const readerStream = await createReadStream(filepath);

            if (readerStream) {
              const fileClassifyObj = getFileClassify(ext);

              const { extName, fileClassify } = fileClassifyObj;
              const { uploadDir } = KOA_BODY_CONFIG.formidable;
              const writeNewPath = fileClassify
                ? `${uploadDir}\\${fileClassify}`
                : uploadDir;

              const bool = await createDir(writeNewPath);

              if (bool) {
                const currentTimeStr = moment().format("YYYYMMDDHHmmss");

                const newFileName = `${currentTimeStr}-${name || "文件"
                  }${extName}`;

                const writeStreamPath = `${writeNewPath}/${newFileName}`;
                const writeStream = await createWriteStream(writeStreamPath);
                // 将可读流的数据写入可写流
                readerStream.pipe(writeStream);

                // 删除源文件
                console.log("删除源文件", isDeleteOriginFile);
                isDeleteOriginFile && unlinkFile(filepath);

                resolve(
                  `${UPLOAD_FILE_STORE_ROOT_PATH}/${fileClassify}/${newFileName}`
                );
              } else {
                reject(`移动文件失败`);
              }
            } else {
              reject(`上传文件【${filepath}】,可读流数据创建失败`);
            }
          } else {
            reject(`上传文件【${filepath}】获取分组失败，文件分类取消`);
          }
        } catch (error) {
          reject(`文件移动失败`, error);
        }
      } else {
        reject(`上传文件的文件路径【${originalFilename}】缺失`);
      }
    } else {
      reject(`上传文件的文件名【${originalFilename}】缺失`);
    }
  });
}

/**
 * @description: 上传文件方法
 * @param {*} ctx
 * @return {*}
 */
const unploadFileFun = async (ctx) => {
  console.log("上传文件方法", ctx.request);
  const file = ctx.request?.files?.file; // 获取上传的文件
  if (file) {
    let uploadResult = null;
    if (Array.isArray(file) && file?.length) {
      const promiseArr = file.map((ele) => storeUploadFileByClassify(ele));
      uploadResult = await Promise.all(promiseArr);
    } else {
      uploadResult = await storeUploadFileByClassify(file);
    }

    console.log("uploadResult=====>", uploadResult);

    if (uploadResult) {
      ctx.body = new SuccessModel(uploadResult);
    } else {
      ctx.body = new ErrorModel("文件上传失败");
    }
  } else {
    ctx.body = new ErrorModel("未获取到上传文件");
  }
};

/**
 * @description: 下载文件，返回文件流
 * @param {*} ctx
 * @return {blob} 二进制文件流
 * 
 * ```
 *  无token请求： 'http://www.localhost:3008/v1/admin/download?fileUrl=/uploads/image/20230707174846-1.jpg'
 *  有token请求： 'http://www.localhost:3008/v1/api/download?fileUrl=/uploads/image/20230707174846-1.jpg'
 * 
 *   "fileUrl": "/uploads/excel/20230707174846-零担重量&体积模板范围（客户-琦富瑞） -5-5办事处重量体积上虞.xlsx"
 *   "fileUrl": "/uploads/image/20230707174846-1.jpg"
 *   "fileUrl": "/uploads/txt/20230708091334-脱敏.txt"
 * ```
 */
const downloadFileFun = async (ctx) => {
  const bodyData = ctx.request.body;
  const queryData = ctx.request.query;

  let fileUrl = bodyData?.fileUrl || queryData?.fileUrl;

  if (fileUrl) {
    try {
      const downLoadFilePath = path.join(
        __dirname,
        "../",
        ASSETS_ROOT_PATH,
        fileUrl
      );
      console.log("downLoadFilePath=====>", downLoadFilePath);

      const isFileExistedBool = await isFileExisted(downLoadFilePath);

      if (isFileExistedBool) {
        const stats = fs.statSync(downLoadFilePath);
        const { base: filename, ext } = path.parse(fileUrl);

        if (filename) {
          const imageExtNameList = UPLOAD_FILE_STORE_EXTNAME_LIST.image;
          if (imageExtNameList.includes(ext)) {
            ctx.set("Content-Type", "application/octet-stream");
            ctx.set("Content-Disposition", `attachment; filename=${filename}`);
            ctx.set("Content-Length", stats.size);
          }

          ctx.body = fs.createReadStream(downLoadFilePath);
        } else {
          ctx.body = new ErrorModel(
            `下载路径为【${fileUrl}】，未在服务器中找到该资源`
          );
        }
      } else {
        ctx.body = new ErrorModel(
          `下载路径为【${fileUrl}】，未在服务器中找到该资源`
        );
      }
    } catch (error) {
      console.log("error=====>", error);
      ctx.body = new ErrorModel(`下载路径为【${fileUrl}】，下载文件失败`);
    }
  } else {
    ctx.body = new ErrorModel("未获取到需要下载的文件路径");
  }
};

module.exports = {
  getFileClassify,
  unploadFileFun,
  downloadFileFun,
};
