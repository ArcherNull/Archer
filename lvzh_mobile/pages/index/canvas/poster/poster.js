Page({
  data: {
    // 网图
    // shareImgs:[
    //   {id: 0, img_url: "https://z3.ax1x.com/2021/09/04/h2JPgO.jpg",  code_url: "https://z3.ax1x.com/2021/09/04/h2tH8P.png"},
    //   {id: 1, img_url: "https://z3.ax1x.com/2021/09/04/h282wR.jpg",  code_url: "https://z3.ax1x.com/2021/09/04/h2tXDg.png"},
    //   {id: 2, img_url: "https://z3.ax1x.com/2021/09/04/h2JcI1.jpg",  code_url: "https://z3.ax1x.com/2021/09/04/h2NQxK.png"},
    //   {id: 3, img_url: "https://z3.ax1x.com/2021/09/04/h2JzLQ.jpg",  code_url: "https://z3.ax1x.com/2021/09/04/h2tXDg.png"},
    //   {id: 4, img_url: "https://z3.ax1x.com/2021/09/04/h2tNcT.jpg", code_url: "https://z3.ax1x.com/2021/09/04/h2tH8P.png"}
    // ],
    // 本地图片
    shareImgs: [{
        id: 0,
        img_url: "../../../../static/posterImg/1.jpg",
        code_url: "../../../../static/posterImg/code1.png"
      },
      {
        id: 1,
        img_url: "../../../../static/posterImg/1.jpg",
        code_url: "../../../../static/posterImg/code1.png"
      },
      {
        id: 2,
        img_url: "../../../../static/posterImg/1.jpg",
        code_url: "../../../../static/posterImg/code1.png"
      },
      {
        id: 3,
        img_url: "../../../../static/posterImg/1.jpg",
        code_url: "../../../../static/posterImg/code1.png"
      }
    ],
    // 当前图片地址
    img_url: 'img/1.jpg',
    // 当前二维码地址
    code_url: 'img/code1.png',
    // 网络地址
    img_urls: 'https://z3.ax1x.com/2021/09/04/h2JPgO.jpg',
    code_urls: 'https://z3.ax1x.com/2021/09/04/h2tH8P.png',
    // 临时地址
    hbpath: '', // 海报
    codepath: '', // 二维码
    widths: '',
    heights: '',
    currentIndex: 0,
  },
  onLoad: function (options) {
    this.setData({
      widths: 480,
      heights: 854,
      img_url: this.data.shareImgs[0].img_url,
      code_url: this.data.shareImgs[0].code_url,
    })
  },

  // 切换海报的选择
  changeHB(e) {
    let index = e.detail.current ? e.detail.current : 0
    this.setData({
      img_url: this.data.shareImgs[index].img_url,
      code_url: this.data.shareImgs[index].code_url,
      currentIndex: index
    })
  },
  // 保存海报
  saveHaiBao() {
    // 若是图片是网络地址，则直接执行ImgUrlToTmp方法
    // this.ImgUrlToTmp(); 

    // 以下方法为本地图片
    this.setData({
      hbpath: this.data.img_url,
      codepath: this.data.code_url
    }, () => {
      let that = this
      that.sharePage()
    })
  },

  // 获取海报图片和二维码临时地址
  ImgUrlToTmp() {
    var that = this;
    wx.showLoading({
      title: '拼命生成中...',
    });
    wx.getImageInfo({
      src: that.data.img_url,
      success(res) {
        console.log("模板图片临时路径:" + res.path);
        that.setData({
          hbpath: res.path
        }, () => {
          console.log(that.data.code_url)
          wx.getImageInfo({
            src: that.data.code_url,
            success(res) {
              console.log("二维码临时路径:" + res.path);
              that.setData({
                codepath: res.path
              }, () => {
                that.sharePage()
              })
            },
            fail(e) {
              console.log(e)
            }
          })
        })
      },
      fail(e) {
        console.log(e)
      }
    })
  },

  // 生成分享海报
  sharePage() {
    var that = this;
    that.createNewImg();
  },

  //将canvas转换为图片保存到本地，然后将图片路径传给image图片的src
  createNewImg: function () {
    var that = this;
    // 获取画布节点
    wx.createSelectorQuery()
      .select('#share')
      .fields({
        node: true,
        size: true,
      })
      .exec(function (res) {
        console.log(res)
        // 获取画布canvas节点
        const canvas = res[0].node
        // 获取画布2d的context对象
        const context = canvas.getContext('2d')

        // 获取画布canvas节点设定的宽高
        const width = res[0].width
        const height = res[0].height

        // restore()恢复之前保存的绘图上下文。
        context.restore();

        // 取倍率， 1px = 2rpx
        const dpr = wx.getSystemInfoSync().pixelRatio

        // 设置画布宽度/高度
        canvas.width = width * dpr
        canvas.height = height * dpr

        // x,y轴缩放，这样做的目的是不同宽度的移动设备保证是1:1的图形比例
        context.scale(dpr, dpr)

        // clearRect清除画布上在该矩形区域内的内容
        context.clearRect(0, 0, width, height);

        // 画布填充得底色
        context.fillStyle = 'white'

        // 绘制矩形 fillRect(number x, number y, number width, number height)
        context.fillRect(0, 0, width, height)

        // save() 保存绘图上下文
        context.save();

        // 画海报
        var path = that.data.hbpath;
        const hbPromise = new Promise((resolve, reject) => {
          // 创建一个图片对象。 支持在 2D Canvas 和 WebGL Canvas 下使用, 但不支持混用 2D 和 WebGL 的方法。创建的hb是一个image对象
          const hb = canvas.createImage()

          // image对象加载成功调用
          hb.onload = () => {
            resolve(hb)
          }

          // image对象加载失败调用
          hb.onerror = () => {
            reject(new Error(`fail to fetch image form: ${path}`))
          }

          // image对象的src属性赋值为path
          hb.src = path
        })
        hbPromise.then(img => {
          // drawImage(string imageResource, number sx, number sy, number sWidth, number sHeight, number dx, number dy, number dWidth, number dHeight) 绘制图像到画布  , imageResource必须下载到本地
          context.drawImage(img, 0, 0, width, height * 0.8)
        })

        // 画二维码
        var codepath = that.data.codepath;
        const codePromise = new Promise((resolve, reject) => {
          const code = canvas.createImage()
          code.onload = () => {
            resolve(code)
          }
          code.onerror = () => {
            reject(new Error(`fail to fetch image form: ${codepath}`))
          }
          code.src = codepath
        })
        codePromise.then(img => {
          context.drawImage(img, 15, height * 0.83, 100, 100)
        })

        // 画话，绘制文本
        var t1 = "长按扫码1";
        var title = "J1ay ' blogs";
        var tishi = "每一個想要學習的念頭，那有可能是未來的你在向你求救。";

        // 绘制第一句文本
        context.fillStyle = '#333';
        context.fillText(t1, 130, height * 0.872);

        // 绘制第二句文本
        context.font = 'normal bold 13px sans-serif';
        context.fillText(title, 130, height * 0.9);

        // 绘制第三句文本
        context.fillStyle = '#999';
        context.font = 'normal 10px sans-serif';
        context.fillText(tishi, 130, height * 0.93);

        // 绘制
        context.stroke();

        // 保存
        context.save();

        setTimeout(() => {
          // 保存到本地
          that.toSave(canvas);
        }, 1000);
      });


  },
  // 打包海报
  toSave(canvas) {
    console.log(canvas)
    let that = this
    // wx.canvasToTempFilePath() 把当前画布指定区域的内容导出生成指定大小的图片。在 draw() 回调里调用该方法才能保证图片导出成功。
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      canvasId: 'share',
      canvas: canvas,
      width: that.data.widths,
      height: that.data.heights,
      destWidth: that.data.widths * wx.getSystemInfoSync().pixelRatio,
      destHeight: that.data.heights * wx.getSystemInfoSync().pixelRatio,
      success: function (res) {
        let canvasToTempFilePath = res.tempFilePath // 返回的图片地址保存到一个全局变量里
        // console.log(res)
        that.saveShareImg(canvasToTempFilePath)
      },
      fail: function (error) {
        console.log(error)
      }
    })
  },
  // 保存到系统相册
  saveShareImg: function (canvasToTempFilePath) {
    // 判断是否授权
    wx.getSetting({
      success(res) {
        wx.hideLoading()
        // 无打开相册权限
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              // 保存图片到相册
              wx.saveImageToPhotosAlbum({
                filePath: canvasToTempFilePath,
                success() {
                  wx.showToast({
                    title: '保存成功',
                    icon: 'success',
                    duration: 2000
                  })
                },
                fail() {
                  wx.showToast({
                    title: '保存失败',
                    icon: 'none'
                  })
                }
              })
            },
            fail() {
              wx.showModal({
                title: '提示',
                content: '请设置允许访问相册，否则将无法使用该功能',
                showCancel: false,
                success(res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                    // 重新设置权限
                    wx.openSetting({
                      success(res) {
                        // 重新设置相册权限成功，就保存当前图片到相册
                        wx.saveImageToPhotosAlbum({
                          filePath: canvasToTempFilePath,
                          success() {
                            wx.showToast({
                              title: '保存成功',
                              icon: 'success',
                              duration: 2000
                            })
                          },
                          fail() {
                            wx.showToast({
                              title: '保存失败',
                              icon: 'error'
                            })
                          }
                        })
                      },
                      fail(err) {
                        console.log(err)
                      }
                    })

                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            }
          })
        } else {
          wx.saveImageToPhotosAlbum({
            filePath: canvasToTempFilePath,
            success() {
              wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 2000
              })
            },
            fail() {
              wx.showToast({
                title: '保存失败',
                icon: 'error'
              })
            }
          })
        }
      },
      fail() {}
    });
  },

  onShareAppMessage: function (res) {
    let conf_ = getApp().globalData.cofData;
    let openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : getApp().globalData.openid;
    return {
      title: conf_.inviteTxt,
      path: "/pages/index/index?oid=" + openid,
      imageUrl: conf_.inviteImg,
    }
  }
})