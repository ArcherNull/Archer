const app = getApp()
const filter = app.commModule.filter  //路由守卫
Page(filter({
  data:{
    //计数器的值
    inputValue:1
  },
  //跳购物车
  jumpShopcar:function(){
    wx.navigateTo({
      url: './shopcar/shopcar',
    })
  }
}))