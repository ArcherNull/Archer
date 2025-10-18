import drawQrcode from '../../../sdk/weapp.qrcode.js'
Page({
    onLoad: function () {
        this.draw()
    },
    draw () {
        drawQrcode({
          width: 160,
          height: 160,
          x: 20,
          y: 20,
          canvasId: 'myQrcode',
          // ctx: wx.createCanvasContext('myQrcode'),
          typeNumber: 10,
          text: '1234',
          image: {
            imageResource: '../../../static/login.png',
            dx: 70,
            dy: 70,
            dWidth: 60,
            dHeight: 60
          },
          callback(e) {
            console.log('e: ', e)
          }
        })
      },
})