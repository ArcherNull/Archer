const app = getApp()
const filter = app.commModule.filter  //路由守卫
Page(filter({
  data: {
    //付款状态
    payStatus: true,
  },
  //点击按钮
  operation: function (ele) {
    var e = ele.currentTarget.dataset.index
    if (e == 0 && this.data.payStatus) {
      //付款成功-查看订单
      console.log('付款成功-查看订单')
    } else if (e == 1 && this.data.payStatus) {
      //付款成功-首页
      console.log('付款成功-首页')
    } else if(e == 0 && !this.data.payStatus){
      //付款失败-返回订单
      console.log('付款失败-返回订单')
    }else if(e == 1 && !this.data.payStatus){
      //付款成功-重新支付
      console.log('付款失败-重新支付')
    }
  }

}))