const app = getApp()
const filter = app.commModule.filter  //路由守卫
const common = app.commModule.common  //公共方法

Page(filter({
  data: {
    longitude: 0, //经度
    latitude: 0, //纬度
    accuracy: 0, //位置的精度
    scale: 14, //缩放级别
  },
  onLoad: function () {
    this.getSetting()
  },
  //获取地理位置
  getLocation: function (that) {
    wx.getLocation({
      type: 'gcj02', //wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      isHighAccuracy: true,
      highAccuracyExpireTime:3500, //高精度定位超时时间(ms)，指定时间内返回最高精度，该值3000ms以上高精度定位才有效果
      success(res) {
        if(res.errMsg == "getLocation:ok"){
          that.chooseLocation(res.longitude, res.latitude)//选择当前位置的信息
        }else{
          common.showMsg('定位请求失败！')
        }
      },
      fail:function(){
        common.showMsg('请检查网络,GPS定位是否开启以及微信地理位置授权情况')
        setTimeout(()=>{
          wx.navigateBack()
        },1500)
      }
    })
  },
  //打开地图选择位置,只有点击确定的收触发
  chooseLocation:function(longitude, latitude){
    let that = this
    wx.chooseLocation({
      longitude : longitude,
      latitude: latitude,
      success:function(res){
        if(res.errMsg == "chooseLocation:ok"){
            that.getPageData(res)
            wx.navigateBack()
        }else{
          common.showMsg('选取位置失败')
          wx.navigateBack()
        }
      },
      fail:function(){
        common.showMsg('选取位置失败')
        wx.navigateBack()
      }
    })
  },
  //错误提示
  errorMsg:function(text){
    wx.showToast({
      title: text,
      icon:'none'
    })
  },

  //获取钱一个页面，并给前一个页面赋值
  getPageData:function(res){
    let pages = getCurrentPages(); 
    let prevPage = pages[pages.length - 2]; 
    //给前一页赋值
    prevPage.setData({
      longitude: res.longitude, //经度
      latitude: res.latitude,//纬度
      address: res.address, //地址
      name:  res.name, //店名
    })
  },
  //如果用户取消授权，再次调用起授权
  getSetting:function(){
    let that = this
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {//非初始化进入该页面,且未授权
          wx.showModal({
            title: '是否授权当前位置',
            content: '需要获取您的地理位置，请确认授权，否则无法获取您所需数据',
            success: function (res) {
              if (res.cancel) {
                common.showMsg('授权失败')
                wx.navigateBack()
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (res) {
                    if (res.authSetting["scope.userLocation"] == true) {
                      common.showMsg('授权成功')
                      //再次授权，调用getLocationt的API
                      that.getLocation(that);
                    } else {
                      common.showMsg('授权失败')
                      wx.navigateBack()
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {//初始化进入
          that.getLocation(that);
        }
        else  { //授权后默认加载
          that.getLocation(that);
        }
      }
    })
  },
}))