Page({
    data: {
        //操作栏
        btnList: [{
            src: '../../static/my_acount.png',
            title: '海报',
            alertInfo: 0,
        }, {
            src: '../../static/my_acount.png',
            title: '签名板',
            alertInfo: 0,
        }, {
            src: '../../static/my_acount.png',
            title: '图形验证码',
            alertInfo: 0,
        }, {
          src: '../../static/my_acount.png',
          title: '图片水印/压缩/剪裁',
          alertInfo: 0,
      }]
    },
    // 点击操作项事件
    clickItemFun(ele) {
        const item = ele.detail
        console.log('点击操作项事件', item)
        let url = ''
        switch (item.title) {
            case '海报':
                console.log('海报')
                url = './poster/poster'
                break;
            case '签名板':
                console.log('签名板')
                url = './signBoard/signBoard'
                break;
            case '图形验证码':
                console.log('图形验证码')
                url = './validateImg/validateImg'
                break;
            case '添加水印':
                console.log('图形验证码')
                url = './validateImg/validateImg'
                break;
        }
        wx.navigateTo({
            url
        })
    },

      /**
   * 添加水印
   */
  watermark: function (imgs) {
    wx.showLoading({
      title: '加载中',
    })
    var vm = this;
    var add = vm.data.address;
    var ctx = wx.createCanvasContext('myCanvas');
    wx.getImageInfo({
      src: imgs,
      success: function (ress) {
        let imheight = ress.height; //图片高度
        let imwidth = ress.width; //图片宽度
        let width = wx.getSystemInfoSync().windowWidth; //可使用窗口宽度
        let s_height = wx.getSystemInfoSync().windowHeight; //可使用窗口宽度
        //比例
        let prop = width / imwidth;
        let height = imheight * prop;
        let path = ress.path;
        ctx.clearRect(0, 0, width, s_height);//清除上次画布内容
        ctx.drawImage(path, 0, 0, width, height);
        ctx.fillStyle = '#FFFFFF';
        var adHei = height * 0.9;
        var timHei = height * 0.96;
        //地址
        if (add) {
          ctx.font = 'normal normal 20px sans - serif'
          ctx.fillText(add, 10, adHei)
        }
        //时间
        ctx.font = 'normal normal 20px sans - serif'
        ctx.fillText(util.formatTime(new Date()).toLocaleString(), 10, timHei)
        ctx.draw(true, function () {
          vm.createImage();
        });
        imheight = 0;
        imwidth = 0;
      },
      fail: function (e) {
        console.log(e);
      }
    })
  },

  /**
   * 画布转换图片
   */
  createImage: function () {
    var vm = this;
    var imgs = vm.data.imgs;
    wx.canvasToTempFilePath({
      canvasId: 'myCanvas',
      success: function (res) {
        wx.hideLoading();
        imgs.push(res.tempFilePath);
        vm.setData({
          imgs: imgs
        })
      }
    })
  },
})