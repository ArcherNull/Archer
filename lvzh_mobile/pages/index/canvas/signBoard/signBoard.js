// pages/sign/sign.js

// 初始化签名变量，放在 Page 前
var content = null;
var touchs = [];
Page({
    data: {
        imgList: [],
        signImage: ''
    },

    onLoad: function (options) {

    },
    // 画布的触摸移动开始手势响应
    start: function (event) {
        // console.log("触摸开始" + event.changedTouches[0].x);
        // console.log("触摸开始" + event.changedTouches[0].y);
        //获取触摸开始的 x,y
        let point = {
            x: event.changedTouches[0].x,
            y: event.changedTouches[0].y
        }
        touchs.push(point);
    },
    // 画布的触摸移动手势响应
    move: function (e) {
        let point = {
            x: e.touches[0].x,
            y: e.touches[0].y
        }
        touchs.push(point);
        if (touchs.length >= 2) {
            this.draw(touchs);
        }
    },
    // 画布的触摸移动结束手势响应
    end: function (e) {
        console.log("触摸结束" + e);
        //清空轨迹数组
        for (let i = 0; i < touchs.length; i++) {
            touchs.pop();
        }
    },
    // 画布的触摸取消响应
    cancel: function (e) {
        console.log("触摸取消" + e);
    },
    // 画布的长按手势响应
    tap: function (e) {
        console.log("长按手势" + e);
    },
    error: function (e) {
        console.log("画布触摸错误" + e);
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //获得Canvas的上下文
        content = wx.createCanvasContext('sign');

        //设置线的颜色
        content.setStrokeStyle("#000");
        //设置线的宽度
        content.setLineWidth(3);
        //设置线两端端点样式更加圆润
        content.setLineCap('round');
        //设置两条线连接处更加圆润
        content.setLineJoin('round');
    },
    //绘制
    draw: function (touchs) {
        let point1 = touchs[0];
        let point2 = touchs[1];
        touchs.shift();
        content.moveTo(point1.x, point1.y);
        content.lineTo(point2.x, point2.y);
        content.stroke();
        content.draw(true);
    },
    //清除操作
    clearClick: function () {
        //清除画布
        content.clearRect(0, 0, 750, 700);
        content.draw(true);
    },
    //保存图片
    saveClick: function () {
        var that = this;
        wx.canvasToTempFilePath({
            canvasId: 'sign',
            success: function (res) {
                //打印图片路径
                console.log(res.tempFilePath);
                that.saveShareImg(res.tempFilePath)
                //设置保存的图片
                that.setData({
                    signImage: res.tempFilePath
                })
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
                    icon: 'error'
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
})