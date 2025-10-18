const app = getApp()
const filter = app.commModule.filter //路由守卫
Page(filter({
  data: {
    //显示提示消息
    alertInfo: true,
    phone:'', // 手机号授权
    //用户信息-提现金额/可用积分
    userMoney: [{
      id: 0,
      src: './../../static/my_money.png',
      num: '30.00',
      text: '账户可提现金额'
    }, {
      id: 1,
      src: './../../static/my_profit.png',
      num: '10000',
      text: '商城可使用积分'
    }],
    //操作栏
    btnList: [{
      id: 0, //操作栏id
      src: '../../static/my_acount.png', //操作栏的icon
      title: '我的账单', //操作栏标题
      alertInfo: 1, //操作栏消息提示
    }, {
      id: 0, //操作栏id
      src: '../../static/my_acount.png', //操作栏的icon
      title: '我的订单', //操作栏标题
      alertInfo: 0, //操作栏消息提示
    }, {
      id: 0, //操作栏id
      src: '../../static/my_acount.png', //操作栏的icon
      title: '采购', //操作栏标题
      alertInfo: 0, //操作栏消息提示
    }, {
      id: 0, //操作栏id
      src: '../../static/my_acount.png', //操作栏的icon
      title: '收货地址', //操作栏标题
      alertInfo: 0, //操作栏消息提示
    }, {
      id: 0, //操作栏id
      src: '../../static/my_acount.png', //操作栏的icon
      title: '退出登录', //操作栏标题
      alertInfo: 0, //操作栏消息提示
    }, ]
  },
  onLoad: function () {
    wx.showTabBarRedDot({index: 1})
    this.getUserData()
  },
  async getUserData(){
    let resData = await app.commModule.apis.getUserInfo()
    console.log('getUserInfo请求得到的数据' , resData)
  },
  // 点击提现和积分
  clickHead(ele) {
    let item = ele.currentTarget.dataset.item
    console.log('用户信息item', item)
    switch (item.text) {
      case '账户可提现金额':
        console.log('账户可提现金额')
        break;
      case '商城可使用积分':
        console.log('商城可使用积分')
        break;
    }
  },
  //按钮跳转
  jumpPage: function (ele) {
    var e = ele.currentTarget.dataset.index
    if (e == 0) {
      //跳转到我的账单
      wx.navigateTo({
        url: './acount/acount',
      })
    } else if (e == 1) {
      //我的订单
      wx.navigateTo({
        url: '/pages/my/order/order',
      })
    } else if (e == 2) {
      //跳转到采购
      wx.navigateTo({
        url: './buy/buy',
      })
    } else if (e == 3) {
      //跳转到收货地址
      wx.navigateTo({
        url: './address/address',
      })
    } else if (e == 4) {
      //退出登录
      wx.showModal({
        cancelColor: 'cancelColor',
        title: '提示',
        content: '是否确认退出登录',
        success: function (res) {
          if (res.confirm) {
            wx.redirectTo({
              url: '../login/login',
            })
          }
          if (res.cancel) {
            console.log('取消退出登录')
          }
        }
      })
    }
  },
  // 获取手机号
  getPhoneNumberFun(ele){
    console.log('获取微信手机号加密信息' , ele.detail)
  }
}))