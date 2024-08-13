/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-08 20:11:35
 * @LastEditTime: 2024-05-08 20:26:20
 * @Description:
 * 参考文档：https://juejin.cn/post/7276023998566973451?searchId=20240508200658F7F203C1867FBC3CB186
 * 将html2canvas转化的图片放到pdf中 参考文档：https://juejin.cn/post/7323436080312893476?from=search-suggest
 *
 * 示例demo: https://codesandbox.io/p/github/janice143/pdf-demo/master?file=%2Fsrc%2Fpdf-demo%2Fpdf-print.ts%3A107%2C18
 *
 * 使用fabric.js+pdf.js实现简易盖章 : https://juejin.cn/post/6859254890460512264?from=search-suggest
 *
 */

/* 
使用 html2canvas 捕捉 HTML 内容或特定的 HTML 元素，并将其转换为 Canvas。其中，html2canvas 函数的主要用法是：

html2canvas(element, options);


element： 要渲染为 canvas 的 HTML 元素。这可以是一个 DOM 元素，也可以是一个选择器字符串，表示需要渲染的元素。
options（可选）： 一个包含配置选项的对象，用于定制 html2canvas 的行为。

以下是一些常见的配置选项：

allowTaint（默认值: false）： 是否允许加载跨域的图片，默认为 false。如果设为 true，html2canvas 将尝试加载跨域的图片，但在某些情况下可能会受到浏览器的限制。
backgroundColor（默认值: #ffffff）： canvas 的背景颜色。
useCORS（默认值: false）： 是否使用 CORS（Cross-Origin Resource Sharing）来加载图片。如果设置为 true，则 html2canvas 将尝试使用 CORS 来加载图片。
logging（默认值: false）： 是否输出日志信息到控制台。
width 和 height： canvas 的宽度和高度。如果未指定，则默认为目标元素的宽度和高度。
scale（默认值: window.devicePixelRatio）： 缩放因子，决定 canvas 的分辨率。

*/

import html2Canvas from "html2canvas";

import JsPDF from "jspdf";

/**
 * @description: 页面导出为pdf格式
 * @param {string} title 表示为下载的标题
 * @param {HTMLElement} html l表示document.querySelector('#myPrintHtml')
 * @return {*}
 */
export function htmlPdf(title, html) {
  html2Canvas(html, {
    allowTaint: true,
    useCORS: true,
    dpi: window.devicePixelRatio * 4, // 将分辨率提高到特定的DPI 提高四倍
    background: "#FFFFFF",
  }).then((canvas) => {
    //未生成pdf的html页面高度
    var leftHeight = canvas.height;

    var a4Width = 595.28;
    //A4大小，210mm*297mm，四边各保留10mm的边距，显示区域190x277 //一页pdf显示html页面生成的canvas高度;
    var a4Height = 841.89;
    var a4HeightRef = Math.floor((canvas.width / a4Width) * a4Height); //pdf页面偏移

    var position = 0;

    var pageData = canvas.toDataURL("image/jpeg", 1.0);

    var pdf = new JsPDF("p", "pt", "a4"); //A4纸，纵向
    var index = 1,
      canvas1 = document.createElement("canvas"),
      height;
    pdf.setDisplayMode("fullwidth", "continuous", "FullScreen");

    // var pdfName = title;
    function createImpl(canvas) {
      console.log(leftHeight, a4HeightRef);
      if (leftHeight > 0) {
        index++;

        var checkCount = 0;
        if (leftHeight > a4HeightRef) {
          var i = position + a4HeightRef;
          for (i = position + a4HeightRef; i >= position; i--) {
            var isWrite = true;
            for (var j = 0; j < canvas.width; j++) {
              var c = canvas.getContext("2d").getImageData(j, i, 1, 1).data;

              if (c[0] != 0xff || c[1] != 0xff || c[2] != 0xff) {
                isWrite = false;
                break;
              }
            }
            if (isWrite) {
              checkCount++;
              if (checkCount >= 10) {
                break;
              }
            } else {
              checkCount = 0;
            }
          }
          height =
            Math.round(i - position) || Math.min(leftHeight, a4HeightRef);
          if (height <= 0) {
            height = a4HeightRef;
          }
        } else {
          height = leftHeight;
        }

        canvas1.width = canvas.width;
        canvas1.height = height;

        console.log(index, "height:", height, "pos", position);

        var ctx = canvas1.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          position,
          canvas.width,
          height,
          0,
          0,
          canvas.width,
          height
        );

        // var pageHeight = Math.round((a4Width / canvas.width) * height);
        // pdf.setPageSize(null,pageHeight)

        if (position != 0) {
          pdf.addPage();
        }
        pdf.addImage(
          canvas1.toDataURL("image/jpeg", 1.0),
          "JPEG",
          10,
          10,
          a4Width,
          (a4Width / canvas1.width) * height
        );
        leftHeight -= height;
        position += height;
        if (leftHeight > 0) {
          setTimeout(createImpl, 500, canvas);
        } else {
          pdf.save(title + ".pdf");
        }
      }
    } //当内容未超过pdf一页显示的范围，无需分页

    if (leftHeight < a4HeightRef) {
      pdf.addImage(
        pageData,
        "JPEG",
        0,
        0,
        a4Width,
        (a4Width / canvas.width) * leftHeight
      );
      pdf.save(title + ".pdf");
    } else {
      try {
        pdf.deletePage(0);
        setTimeout(createImpl, 500, canvas);
      } catch (err) {
        console.log(err);
      }
    }
  });
}

export default htmlPdf;
