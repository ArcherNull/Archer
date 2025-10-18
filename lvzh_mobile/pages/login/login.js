Page({
  data: {
    tags: [{
      name: '登录',
      active: true,
      id: 0
    }, {
      name: '注册',
      active: false,
      id: 1
    }],
    myValue: '',
    myPassword: '',
    seeBool: false,
    isPassword: 'password',
    checkBool: false,
    myName: '',
    myTel: '',
    myInfo: '',
    myPerTel: '',
    sendInfo: true,
    arrayList1: [{
      id: 0,
      text: '医院'
    }, {
      id: 1,
      text: '商超'
    }, {
      id: 2,
      text: '其他'
    }],
    arrayList2: [{
      id: 0,
      text: '代理商'
    }, {
      id: 1,
      text: '运维人员'
    }, {
      id: 2,
      text: '其他'
    }],
  },
  clickTag: function (e) {
    e = e.detail.e
    var str1 = 'tags[0].active'
    var str2 = 'tags[1].active'
    if (e == 0) {
      this.setData({
        [str1]: true,
        [str2]: false,
      })
    } else {
      this.setData({
        [str1]: false,
        [str2]: true,
      })
    }
  },
  inputMyValue: function (e) {
    e = e.detail.value
    this.setData({
      myValue: e
    })
  },
  inputMyPassword: function (e) {
    e = e.detail.value
    this.setData({
      myPassword: e
    })
  },
  clickImg: function (e) {
    e = e.currentTarget.dataset.index
    if (e == 0) {
      this.setData({
        myValue: ''
      })
    } else if (e == 1) {
      this.setData({
        seeBool: true,
        isPassword: 'text'
      })
    } else if (e == 2) {
      this.setData({
        seeBool: false,
        isPassword: 'password'
      })
    } else if (e == 3) {
      this.setData({
        myName: '',
      })
    } else if (e == 4) {
      this.setData({
        myTel: '',
      })
    } else if (e == 5) {
      this.setData({
        myPassword: '',
      })
    } else {
      this.setData({
        myPerTel: '',
      })
    }
  },
  //记住密码
  clickCheck: function (e) {
    e = e.detail.a
    console.log(e)
  },
  //忘记密码
  jumpForget: function () {
    wx.navigateTo({
      url: './forgetPassWord/forgetPassWord',
    })
  },
  //登录
  clickLogin: function () {
    wx.switchTab({
      url: '../index/index',
    })
  },
  /* 注册 */
  //输入姓名
  inputMyName: function (e) {
    e = e.detail.value
    this.setData({
      myName: e
    })
  },
    //输入电话号码
  inputMyTel: function (e) {
    e = e.detail.value
    this.setData({
      myTel: e
    })
  },
  //输入短信验证码
  inputMyInfo: function (e) {
    e = e.detail.value
    this.setData({
      myInfo: e
    })
  },
  
  inputMyPerTel: function (e) {
    e = e.detail.value
    this.setData({
      myPerTel: e
    })
  },

  clickSubmit: function () {

  },


})