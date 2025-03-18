/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-05-08 17:39:26
 * @LastEditTime: 2024-05-08 18:12:08
 * @Description:
 * 官方文档：https://artskydj.github.io/jsPDF/docs/index.html
 * 
 */
import JsPDF from "jspdf";

/* 
jsPDF 是一个用于创建 PDF 文件的 JavaScript 库。以下是 jsPDF 常用的参数：

jsPDF('1', 'pt', [width, height]): 创建一个新的 PDF 对象，其中 '1' 表示 A4 纸张（l:竖向，p:横向），'pt' 表示单位为 point，width 和 height 分别表示页面宽度和高度。
pdf.setFont(font, size): 设置 PDF 文件的字体和大小。其中 font 表示字体名称，如 'Helvetica' 或 'Times'，size 表示字体大小。
pdf.setLineWidth(width): 设置 PDF 文件的线宽。其中 width 表示线宽的像素值。
pdf.drawLine(x1, y1, x2, y2): 在 PDF 文件中绘制一条直线。其中 x1、y1 和 x2、y2 分别表示直线的起点和终点坐标。
pdf.drawRect(x, y, width, height): 在 PDF 文件中绘制一个矩形。其中 x、y 分别表示矩形左上角的坐标，width 和 height 分别表示矩形的宽度和高度。
pdf.drawText(text, x, y): 在 PDF 文件中绘制一段文本。其中 text 表示要绘制的文本，x 和 y 分别表示文本的左上角坐标。
pdf.save('filename.pdf'): 将 PDF 文件保存为指定的文件名。其中 'filename.pdf' 表示要保存的 PDF 文件的文件名。
pdf.addImage(imageData, type, x, y, width, height): 在 PDF 文件中添加一个图像。其中 imageData 表示图像的数据，type 表示图像的类型，如 'JPEG' 或 'PNG'，x、y 分别表示图像左上角的坐标，width 和 height 分别表示图像的宽度和高度。
pdf.rotate(angle, x, y): 旋转 PDF 文件中的图像或文本。其中 angle 表示旋转的角度，x 和 y 分别表示旋转中心的位置。
pdf.translate(x, y): 将 PDF 文件中的文本或图像移动到指定位置。其中 x 和 y 分别表示要移动的坐标。
*/


export function exportPDFFile(text) {
  const doc = new JsPDF();

  doc.text(text, 10, 10);
  doc.save("a4.pdf");
}
