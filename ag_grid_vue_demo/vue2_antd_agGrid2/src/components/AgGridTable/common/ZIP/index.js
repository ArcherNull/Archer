/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-08 17:39:47
 * @LastEditTime: 2024-05-08 18:15:17
 * @Description:
 */
import { saveAs } from "file-saver";
import { message as Message } from "ant-design-vue";

import * as JSZip from "jszip";
/**
 * @description: 下载二维码压缩包
 * @param {Array[]} imgArr 二维码数组
 * @param {String} fileName 压缩包文件名
 * @return {*}
 */
export function qrCodeDownLoadZipFile(
  imgArr = [],
  fileName = "压缩包",
  suffix = "png"
) {
  if (imgArr.length) {
    const zip = new JSZip(); // 实例化zip
    const img = zip.folder("qrCode"); // zip包内的文件夹名字
    imgArr.forEach((item) => {
      // listOfData是含有图片的数据数组
      const basePic = item.url.replace(/^data:image\/(png|jpg);base64,/, ""); // 生成base64图片数据
      img.file(item.name + "." + suffix, basePic, {
        base64: true,
      }); // 将图片文件加入到zip包内
    });
    zip
      .generateAsync({
        type: "blob",
      }) // zip下载
      .then(function (content) {
        // see FileSaver.js
        saveAs(content, `${fileName}.zip`); // zip下载后的名字
      });
  } else {
    Message.warning("压缩不存在对应文件！");
  }
}
