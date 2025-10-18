const app = getApp()
/* 缺陷：大图片水印添加失败 */
Component({
  options: {
    addGlobalClass: true
  },
  data: {
    windowWidth: 0,
    windowHeight: 0
  },
  lifetimes: {
    ready() {
      const that = this
      wx.getSystemInfo({
        success: (res) => {
          if (res.errMsg === 'getSystemInfo:ok') {
            const windowWidth = res.windowWidth; // 页面宽度
            const windowHeight = res.windowHeight; // 页面高度
            that.setData({
              windowWidth,
              windowHeight
            })
          } else {
            app.commModule.common.showMsg('未获取到设备信息')
          }
        }
      });
    }
  },
  properties: {
    // 已上传的图片
    imgList: {
      type: Array,
      value: []
    },
    // 一次性上传多少张图片
    maxUpLoadimgNum: {
      type: Number,
      value: 1
    },
    // 上传限制数量
    limitNum: {
      type: Number,
      value: 1
    },
    // 是否添加水印文本
    watermarkText: {
      type: String,
      value: ''
    }
  },
  methods: {
    //图片上传选择区域
    chooseImage: function (ele) {
      const that = this
      wx.chooseMedia({
        count: that.properties.maxUpLoadimgNum, //最多可以选择几张图片
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        mediaType: ['image'],
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          const allImgList = res.tempFiles.map(ele => ele.tempFilePath)
          console.log('上传成功', allImgList)
          that.triggerEvent('updateImage', {
            img: allImgList
          })

          // 暂时先兼容单个上传
          // res.tempFilePaths.forEach((ele) => {
          //     that.addWatermark(ele)
          // })
        },
        fail: function (res) {
          wx.showToast({
            title: '图片上传失败',
            icon: 'none',
            duration: 2000,
          })
        }
      })
    },

    // 删除图片
    deleteImage: function (ele) {
      const that = this
      const index = ele.currentTarget.dataset.index
      wx.showModal({
        title: '提示',
        content: '是否删除图片？',
        success(res) {
          if (res.confirm) {
            console.log('用户确认删除')
            that.triggerEvent('deleteImg', index)
          }
        }
      })
    },

    // 注意：本地上传的图片没有转换成https链接的形式【本地的https链接不行】，在页面内无法实现小图片预览，当然可以通过wx.previewImg预览；可以通过canvas转换成小程序能够识别的图片，添加水印的目的也是为了先不通过服务器转https链接使得小图片上传后本地预览

    // 添加水印
    addWatermark: function (img) {
      const that = this
      wx.showLoading({
        title: '上传中...',
      })
      // 因为我们是在组件内创建canvas,所以要在第二个参数中加this,指定当前环境为组件环境，而不是page环境，page环境就不用加，因为默认就有
      let ctx = wx.createCanvasContext('watermarkCanvas', this);
      wx.getImageInfo({
        src: img,
        success: function (res) {
          console.log('获取到的图片信息', res)
          if (res.errMsg === 'getImageInfo:ok') {
            let {
              windowWidth,
              windowHeight
            } = that.data

            let imgHeight = res.height; //图片高度
            let imgWidth = res.width; //图片宽度

            //获取不同设备尺寸的缩放比例
            let scaleIndex = windowWidth / imgWidth;
            let drawImgheight = imgHeight * scaleIndex;
            let centerY = Math.ceil(drawImgheight / 2 - imgHeight / 2) // 居中定位Y

            console.log(scaleIndex, drawImgheight)

            const path = res.path; // 选取图片文件wx.chooseImage生成的图片路径

            console.log('path', path)

            ctx.clearRect(0, 0, windowWidth, windowHeight); //清除上次画布内容
            ctx.drawImage(path, 0, centerY, windowWidth, drawImgheight); // 将本地图片放置于画布中

            ctx.fillStyle = '#FFFFFF'; // 绘制颜色为白色

            // 获取绘制于图片上的水印的y坐标
            const watermarkY = drawImgheight * 0.9 + centerY;
            const timeStrY = drawImgheight * 0.96 + centerY;

            // 绘制水印文本
            const watermarkText = that.properties.watermarkText
            if (watermarkText) {
              ctx.font = 'normal normal 20px sans - serif'
              ctx.fillText(watermarkText, 10, watermarkY)
            }

            // 绘制水印时间
            ctx.font = 'normal normal 20px sans - serif'
            ctx.fillText(app.commModule.common.formatTime(new Date()).toLocaleString(), 10, timeStrY)

            ctx.draw(true, function () {
              that.createImage();
            });
            imgHeight = 0;
            imgWidth = 0;
          } else {
            app.commModule.common.showMsg('添加水印失败')
          }
        },
        fail: function (e) {
          app.commModule.common.showMsg('添加水印失败')
        }
      })
    },

    // 画布转换图片
    createImage: function () {
      const that = this;
      // 在组件内使用canvas,需要绑定this
      wx.canvasToTempFilePath({
        canvasId: 'watermarkCanvas',
        // fileType:'jpg',
        success: function (res) {
          wx.hideLoading();
          console.log('res.tempFilePath', res.tempFilePath)
          const obj = {
            img: res.tempFilePath
          }
          if (that.properties.watermarkText) {
            obj.watermarkText = that.properties.watermarkText
          }
          that.triggerEvent('updateImage', [obj])
          // imgList.push(res.tempFilePath);
        }
      }, this)
    },

    //预览图片
    previewImg: function () {
      const urls = this.properties.imgList.map(ele => ele.img)
      wx.previewImage({
        urls,
      })
    }
  }
})