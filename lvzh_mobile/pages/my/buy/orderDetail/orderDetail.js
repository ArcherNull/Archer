Page({
  data: {
    //订单状态
    status_text: '已完成',
    //订单折叠，打开或者关闭开关
    showProcess: true,
    //订单状态
    order_status: '未通过',
    //整个订单状态
    status: 0, // 0为正在进行；1为交易完成；2为订单被驳回
    //订单流程状态
    processList: [{
      id: 0, //流程id
      process_title: '创建订单', //流程名
      process_createTime: '2020-10-15 16:00:00', //创建时间
      prpocess_check: '未通过', //流程审核状态
      process_checkId: 0, //流程审核id
      process_checkText: '原因：前天就发了袋子前天就发了袋子前天就发了袋子前天就发了袋子前天就发了袋子前天就发了袋子前天就发了前天就发了袋子前天就发了袋子前天就发了袋子袋子袋子前天就发了前天就发了袋子前天就发了袋子前天就发了袋子袋',//流程审核备注
      order_number:'123456789415525',//订单号
    }]
  },
  //打开或者关闭
  showClose: function () {
    this.setData({
      showProcess: !this.data.showProcess
    })
  },
  //点击按钮
  clickBtn: function (ele) {
    var e = ele.currentTarget.dataset.index
    if (e == 0) {
      //重新下单
      console.log('重新下单')

    } else if (e == 1) {
      //催办
      console.log('催办')

    } else if (e == 2) {
      //确认收货
      console.log('确认收货')

    } else if (e == 3) {
      //重新下单
      console.log('重新下单')

    }
  },
  //复制文本
  copyText: function () {
    console.log('复制单号')
    wx.setClipboardData({
      data: '123456789415525',
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data)
          }
        })
      }
    })
  },
})