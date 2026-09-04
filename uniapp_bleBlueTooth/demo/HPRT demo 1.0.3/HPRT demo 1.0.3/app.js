//app.js
App({
  onShow(){
    wx.onMemoryWarning(function () {
      console.log('onMemoryWarningReceive')
      // wx.showModal({
      //   content: 'onMemoryWarningReceive',
      //   showCancel: false
      // })
    })
  },
  onHide(){
    wx.offMemoryWarning(function () {
      console.log('offMemoryWarning')
      // wx.showModal({
      //   content: 'offMemoryWarning',
      //   showCancel: false
      // })
    })
  }
})