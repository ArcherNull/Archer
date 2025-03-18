/**
 * @description: 设置水印
 * @param { Object } settings 水印的相关参数，设置如下defaultSettings
 * @return {*}
 */
export function setWatermark(settings) {
  // 默认设置
  const defaultSettings = {
    watermark_txt: "text",
    watermark_classname: "mask_div", // 如果需要给单独的盒子加水印，需要命名特殊一点的classname
    watermark_x: 20, // 水印起始位置x轴坐标
    watermark_y: 20, // 水印起始位置Y轴坐标
    watermark_rows: 20, // 水印行数
    watermark_cols: 20, // 水印列数
    watermark_x_space: 100, // 水印x轴间隔
    watermark_y_space: 50, // 水印y轴间隔
    watermark_color: "#aaa", // 水印字体颜色
    watermark_alpha: 0.4, // 水印透明度
    watermark_fontsize: "15px", // 水印字体大小
    watermark_font: "微软雅黑", // 水印字体
    watermark_width: 210, // 水印宽度
    watermark_height: 80, // 水印长度
    watermark_angle: 15, // 水印倾斜度数
    // watermark_id: 'test'
  };
  const mergeObject = Object.assign(defaultSettings, settings);

  const mask_div_classname = mergeObject.watermark_classname;
  // 检查原容器内是否存有水印
  const judgeWatermaskInCOntainer = () => {
    console.log("检查原容器内是否存有水印");
    const watermarkDom = document.querySelectorAll(`.${mask_div_classname}`);
    console.log("watermarkDom", watermarkDom);
    if (watermarkDom.length) {
      console.log("存在水印DOM");
      return watermarkDom;
    } else {
      console.log("不存在水印DOM");
      return [];
    }
  };

  // 清除DOM水印
  const clearWatermark = (watermarkDom) => {
    console.log("清除水印");
    const watermarkParentDom = watermarkDom[0].parentNode;
    console.log("watermarkParentDom", watermarkParentDom);
    if (watermarkParentDom) {
      watermarkDom.forEach((ele) => {
        watermarkParentDom.removeChild(ele);
      });
    } else {
      console.error("未获取到水印的父节点");
    }
  };

  const oTemp = document.createDocumentFragment();

  let clientWidth, scrollWidth;
  let clientHeight, scrollHeight;
  let dom;
  const hasWatermarkDom = judgeWatermaskInCOntainer();
  console.log("hasWatermarkDom", hasWatermarkDom);
  if (!hasWatermarkDom.length) {
    // 如果存在传入id， 以id盒子为容器
    if (mergeObject.watermark_id) {
      dom = document.getElementById(mergeObject.watermark_id);
      clientWidth = dom.clientWidth;
      scrollWidth = dom.scrollWidth;
      scrollHeight = dom.scrollHeight;
      clientHeight = dom.clientHeight;
    } else {
      // 不存在传入id,则以body标签为水印添加的容器
      dom = document.body;
      clientWidth = document.body.scrollWidth;
      clientHeight = document.body.clientWidth;
      scrollHeight = document.body.scrollHeight;
      clientHeight = document.body.clientHeight;
    }

    // 获取页面最大宽度
    const p_width = Math.max(scrollWidth, clientWidth);
    const cutWidth = p_width * 0.015;
    const page_width = p_width - cutWidth;
    // 获取页面最大高度
    const page_height = Math.max(scrollHeight, clientHeight);
    // let page_height = document.body.scrollHeight+document.body.scrollTop;
    // 如果将水印列数设置为0，或水印列数设置过大，超过页面最大宽度，则重新计算水印列数和水印x轴间隔
    if (
      mergeObject.watermark_cols === 0 ||
      parseInt(
        mergeObject.watermark_x +
          mergeObject.watermark_width * mergeObject.watermark_cols +
          mergeObject.watermark_x_space * (mergeObject.watermark_cols - 1)
      ) > page_width
    ) {
      mergeObject.watermark_cols = parseInt(
        (page_width - mergeObject.watermark_x + mergeObject.watermark_x_space) /
          (mergeObject.watermark_width + mergeObject.watermark_x_space)
      );
      mergeObject.watermark_x_space = parseInt(
        (page_width -
          mergeObject.watermark_x -
          mergeObject.watermark_width * mergeObject.watermark_cols) /
          (mergeObject.watermark_cols - 1)
      );
    }
    // 如果将水印行数设置为0，或水印行数设置过大，超过页面最大长度，则重新计算水印行数和水印y轴间隔
    if (
      mergeObject.watermark_rows === 0 ||
      parseInt(
        mergeObject.watermark_y +
          mergeObject.watermark_height * mergeObject.watermark_rows +
          mergeObject.watermark_y_space * (mergeObject.watermark_rows - 1)
      ) > page_height
    ) {
      mergeObject.watermark_rows = parseInt(
        (mergeObject.watermark_y_space +
          page_height -
          mergeObject.watermark_y) /
          (mergeObject.watermark_height + mergeObject.watermark_y_space)
      );
      mergeObject.watermark_y_space = parseInt(
        (page_height -
          mergeObject.watermark_y -
          mergeObject.watermark_height * mergeObject.watermark_rows) /
          (mergeObject.watermark_rows - 1)
      );
    }
    let x;
    let y;
    for (let i = 0; i < mergeObject.watermark_rows; i++) {
      y =
        mergeObject.watermark_y +
        (mergeObject.watermark_y_space + mergeObject.watermark_height) * i;
      for (let j = 0; j < mergeObject.watermark_cols; j++) {
        x =
          mergeObject.watermark_x +
          (mergeObject.watermark_width + mergeObject.watermark_x_space) * j;
        const mask_div = document.createElement("div");
        mask_div.id = "mask_div" + i + j;
        mask_div.className = mask_div_classname;
        mask_div.appendChild(
          document.createTextNode(mergeObject.watermark_txt)
        );
        // 设置水印div倾斜显示
        mask_div.style.webkitTransform =
          "rotate(-" + mergeObject.watermark_angle + "deg)";
        mask_div.style.MozTransform =
          "rotate(-" + mergeObject.watermark_angle + "deg)";
        mask_div.style.msTransform =
          "rotate(-" + mergeObject.watermark_angle + "deg)";
        mask_div.style.OTransform =
          "rotate(-" + mergeObject.watermark_angle + "deg)";
        mask_div.style.transform =
          "rotate(-" + mergeObject.watermark_angle + "deg)";
        mask_div.style.visibility = "";
        mask_div.style.position = "absolute";
        mask_div.style.left = x + "px";
        mask_div.style.top = y + "px";
        mask_div.style.overflow = "hidden";
        mask_div.style.zIndex = "9999";
        mask_div.style.pointerEvents = "none"; // pointer-events:none 让水印不遮挡页面的点击事件
        mask_div.style.opacity = mergeObject.watermark_alpha;
        mask_div.style.fontSize = mergeObject.watermark_fontsize;
        mask_div.style.fontFamily = mergeObject.watermark_font;
        mask_div.style.color = mergeObject.watermark_color;
        mask_div.style.textAlign = "center";
        mask_div.style.width = mergeObject.watermark_width + "px";
        mask_div.style.height = mergeObject.watermark_height + "px";
        mask_div.style.display = "block";
        oTemp.appendChild(mask_div);
      }
    }
    dom.appendChild(oTemp);
  } else {
    clearWatermark(hasWatermarkDom);
  }
}
