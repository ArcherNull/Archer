import Canvas from "../../../../common/scrollline.js"

Page({
    // 引入文件的函数 
    ...Canvas.options,
  data: {
    ...Canvas.data,
  },
  onLoad: function (options) {
    this.getRes()
  },
})