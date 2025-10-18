const { default: apis } = require("../../../server/api");

const app = getApp()

Page({
  data: {
    // 弹窗遮罩层样式
    stylesPopups: {
      // 大转盘弹窗
      width: '100%',
      height: '100%',
      zIndex: '1000',
      position: 'absolute',
      top: 0,
      backgroundColor: 'rgba(0,0,0,0.5)'
    },
    showPopMask: true, // 电话弹窗的显示和隐藏
    loginLoading: false, // 微信登录loading
    selected: false, // 是否选中
    userData: null, // 用户授权验证成功获取的对象
    phoneObj: null, // 手机号验证对象
  },
  onShow(){

  },
  // 获取用户信息
  getuser() {
    let that = this;
    if (!that.data.selected) {
      app.commModule.common.showMsg('请先勾选阅读并同意《用户协议》和《隐私政策》')
      return
    }
    that.setData({
      loginLoading : true
    })
    that.getUserData()

  },

  getUserData(){
    let that = this
    app.commModule.common.getuserinfo().then(res=>{
      console.log('getuserinfo的res' , res)
      if(res.errMsg == "getUserProfile:ok"){
        console.log('户个人信息', res.userInfo);
        app.commModule.common.wxLogin().then(resData=>{
          console.log('wxLogin的code' , resData)

          // 请求登录接口


        })
      }
    })
  },


  // 关闭通知弹窗
  closeRules() {
    this.rulesShow = !this.rulesShow;
  },
  // 操作
  operation(ele) {
    let that = this
    let index = ele.currentTarget.dataset.index
    console.log('操作进入', index)
    if(index == 0){
      console.log('同意协议');
      that.setData({
        selected: !that.data.selected
      })
    }else if(index == 1){
      console.log('用户协议');
      uni.navigateTo({
        url: './agreement'
      });
    }else{
      console.log('隐私政策');
      uni.navigateTo({
        url: './agreement'
      });
    }
  },

  // 获取到手机号
  getPhoneFun(ele) {
    let that = this
    let userInfo = that.userData.userInfo
    let code = that.userData.code
    console.log('获取到手机号', ele);
    if (ele.errMsg == "getPhoneNumber:ok") {
      that.$api.wxLogin.wxLogin({
        sex: userInfo.gender,
        city: userInfo.city,
        province: userInfo.province,
        country: userInfo.country,
        username: userInfo.username,
        code,
        encryptedData: ele.encryptedData,
        iv: ele.iv,
        cloudID: 'strawmini-5gprzbln5f696dc0',
      }).then(res => {
        console.log('用户登录成功返回数据', res)
      })
    } else {
      that.$commJs.showMsg('获取手机号失败！')
    }

  }



})