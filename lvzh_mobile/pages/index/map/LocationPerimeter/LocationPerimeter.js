const app = getApp()
const filter = app.commModule.filter //路由守卫
const common = app.commModule.common //公共方法
const {
  qqmapsdk
} = app.commModule.sdk
let timer; // 设置定时器
let timerSec = 1000; // 600ms为一个请求间隔, 为getPointList接口使用

Page(filter({
  data: {
    latitude: 34.752465,
    longitude: 113.6653,
    accuracy: 0, //位置的精度  113.6653,34.752465
    scale: 15, //缩放级别
    province: '河南省', //省份
    city: '郑州市', //城市  
    district: '二七区', //区 
    street: '正兴街', //街道
    address: '河南省郑州市二七区正兴街', //地址
    name: '', //店名
    lonValue: '', //输入的经度
    latValue: '', //输入的纬度
    shopsAroundList: [{
        id: 0,
        text: '酒店'
      },
      {
        id: 1,
        text: '餐饮'
      },
      {
        id: 2,
        text: '娱乐'
      },
      {
        id: 3,
        text: '学校'
      },
      {
        id: 4,
        text: '医院'
      },
    ], //周边商店列表
    searchValue: '', //搜索框输入值
    searchIndex: 0, //快捷搜索选中的默认值
    distance: '0.00', // 计算两点之间的距离
    // 开始位置
    startStringIObject: {
      latitude: 39.90469,
      longitude: 116.40717
    },
    // 结束位置
    endStringIObject: [{
      latitude: 31.23037,
      longitude: 121.4737
    }]

    //controls控件 是左下角圆圈小图标,用户无论放大多少,点这里可以立刻回到当前定位(控件（更新一下,即将废弃，建议使用 cover-view 代替）)
    /*     controls: [{
          id: 1,
          iconPath: '../../../../../static/add.png',
          position: {
            left: 15,
            top: 260,
            width: 40,
            height: 40
          },
          clickable: true
        }], */
    /*     markers:[{
          callout: {
            content: '腾讯总部大楼',
            padding: 10,
            borderRadius: 2,
            display: 'ALWAYS'
          },
          latitude: 40.040415,
          longitude: 116.273511,
          iconPath: '../../../../../static/add.png',
          width: '34px',
          height: '34px',
          rotate: 0,
          alpha: 1
        },], */
    //distanceArr: []

  },

  //key 为   CATBZ-K5KK3-DPY3Q-3YIBL-NI4KH-5VBN4
  onLoad: function () {
    //获取当前地位的经纬度
    // this.getLocation()
    // this.getCityList()

  },
  onShow: function () {
    // 调用接口
    //this.searchLocation()
    this.getCityList()
    //this.getDistrictByCityId()
  },

  /**
   * @description: 点击地图获取选取位置的经纬度
   * @return {获取选取位置的 longitude:经度  latitude:纬度 }
   **/
  getLonAndLat: function (ele) {
    console.log(ele)
    let that = this
    that.setData({
      longitude: ele.detail.longitude,
      latitude: ele.detail.latitude
    })
    //that.getCurrentLocation()
    that.getCurrentLocation(ele.detail.longitude, ele.detail.latitude)
  },

  /**
   * @description: 获取当前的地理位置
   * @return {获取当前位置的 longitude:经度  latitude:纬度 }
   **/
  getLocation: function () {
    let that = this
    wx.getLocation({
      type: 'gcj02', //wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      isHighAccuracy: true,
      highAccuracyExpireTime: 3500, //高精度定位超时时间(ms)，指定时间内返回最高精度，该值3000ms以上高精度定位才有效果
      success(res) {
        console.log(res)
        if (res.errMsg == "getLocation:ok") {
          that.getCurrentLocation(res.longitude, res.latitude) //选择当前位置的信息
          that.setData({
            longitude: res.longitude,
            latitude: res.latitude,
          })
        } else {
          common.errorMsg('定位请求失败！')
        }
      },
      fail: function (res) {
        common.errorMsg('请检查网络以及GPS定位是否开启')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    })
  },

  /**
   * @description: 打开所在经纬度的位置的地图
   * @param {经度}  longitude
   * @param {纬度}  latitude
   * @return {获取传递的经纬度的地图 }
   **/
  openLocation: function (longitude, latitude) {
    wx.openLocation({
      longitude: longitude,
      latitude: latitude,
      name: '地址', //定位地址名称
      scale: 28, //缩放比例
      type: 'gcj02', //定位类型
    })
  },

  /**
   * @description: 打开地图选择位置,只有点击确定的收触发
   * @param {经度}  longitude
   * @param {纬度}  latitude
   * @return {获取  adresss：地址； name:店名；  longitude:经度  latitude:纬度  }
   **/
  chooseLocation: function (longitude, latitude) {
    let that = this
    wx.chooseLocation({
      longitude: longitude,
      latitude: latitude,
      success: function (res) {
        console.log(res)
        if (res.errMsg == "chooseLocation:ok") {
          that.getPageData(res)
          wx.navigateBack()
        } else {
          common.errorMsg('选取位置失败')
          wx.navigateBack()
        }
      },
      fail: function (res) {
        common.errorMsg('选取位置失败')
        wx.navigateBack()
      }
    })
  },

  /**
   * @description: 获取前一个页面，并给前一个页面赋值
   * @param {传入请求成功的res}  res
   * @return {给前一个页面赋值  adresss：地址； name:店名；  longitude:经度  latitude:纬度  }
   **/
  getPageData: function (res) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    //给前一页赋值
    prevPage.setData({
      longitude: res.longitude, //经度
      latitude: res.latitude, //纬度
      address: res.address, //地址
      name: res.name, //店名
    })
  },

  /**
   * @description: 引入地图JSSDK,实现搜索地图周边，不传递location对象是根据当前位置
   * @param {搜索值}  keyword
   * @param {经度}  longitude
   * @param {纬度}  latitude
   * @return {获取  province：省； city:市；  district:区 等 }
   **/
  searchLocation: function (keyword, longitude, latitude) {
    let that = this
    qqmapsdk.search({
      location: {
        longitude: longitude || that.data.longitude,
        latitude: latitude || that.data.latitude
      },
      keyword: keyword, //输入的搜索关键字
      success: function (res) {
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
      },
      /*       complete: function (res) {
              console.log(res);
            } */
    })
  },

  // 获取当前地理位置

  /**
   * @description: 使用经纬度解析出当前地理位置文字信息
   * @param {经度}  longitude
   * @param {纬度}  latitude
   * @return {获取  province：省； city:市；  district:区 等 }
   **/
  getCurrentLocation: function (longitude, latitude) {
    let that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        console.log(res)
        if (res.message == "query ok") {
          let result = res.result.ad_info
          let address = res.result.address

          that.setData({
            province: result.province,
            city: result.city,
            district: result.district,
            street: result.street,
            address: address,
          })
        } else {
          common.errorMsg('获取当前地点位置失败！')
        }
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        // console.log(res);
      }
    });
  },

  /**
   * @description: 获取城市列表
   * @return {返回全国城市列表}
   **/
  getCityList: function () {
    let that = this;
    //调用获取城市列表接口
    qqmapsdk.getCityList({
      success: function (res) { //成功后的回调
        console.log(res);
        console.log('省份数据：', res.result[0]); //打印省份数据
        console.log('城市数据：', res.result[1]); //打印城市数据
        console.log('区县数据：', res.result[2]); //打印区县数据
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },

  /**
   * @description: 获取城市区县
   * @param {城市列表id}  id
   * @return {返回全国城市列表 }
   **/
  getDistrictByCityId: function (id) {
    let that = this;
    //调用获取城市列表接口
    qqmapsdk.getCityList({
      success: function (res) { //成功后的回调
        console.log(res);
        console.log('省份数据：', res.result[0])
        var city = res.result[0];
        //根据对应接口getCityList返回数据的Id获取区县数据（以北京为例）
        qqmapsdk.getDistrictByCityId({
          // 传入对应省份ID获得城市数据，传入城市ID获得区县数据,依次类推
          id: id || city[0].id, //对应接口getCityList返回数据的Id，如：北京是'110000'
          success: function (res) { //成功后的回调
            console.log(res);
            console.log('对应城市ID下的区县数据(以北京为例)：', res.result[0]);
          },
          fail: function (error) {
            console.error(error);
          },
          complete: function (res) {
            console.log(res);
          }
        });
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },

  //经纬度搜索输入
  inputLon: function (ele) {
    var e = ele.detail.value
    this.setData({
      lonValue: e
    })
  },
  //纬度搜索框输入
  inputLat: function (ele) {
    var e = ele.detail.value
    this.setData({
      latValue: e
    })
  },
  //经纬度搜索地址按钮
  lonLatBtn: function () {
    let lon = this.data.lonValue
    let lat = this.data.latValue
    if (lon != '' && lat != '' && lat < 90) {
      this.getCurrentLocation(this.data.lonValue, this.data.latValue)
    } else {
      common.errorMsg('请输入正确的经纬度')
    }

  },

  //搜索输入框
  searchInput: function (ele) {
    let that = this
    var e = ele.detail.value
    console.log(e)
    that.setData({
      searchValue: e
    })
  },

  //搜索框按钮--搜索
  searchBtn: function () {
    let that = this
    that.searchLocation(that.data.searchValue)
  },

  //快捷搜索
  clickSearchText: function (ele) {
    let that = this
    let item = ele.currentTarget.dataset.item
    let index = ele.currentTarget.dataset.index
    that.setData({
      searchIndex: index,
    })
    that.searchLocation(item.text)
  },

  // 搜索下拉框
  inputSearch: function (ele) {
    let val = ele.detail.value
    clearInterval(timer);
    timer = setInterval(function () {
      console.log('发送搜索下拉框请求, 最新的搜索下拉框的值为：', val);
      clearInterval(timer);
    }, timerSec);
  },

  // 计算里程
  //计算距离（入参格式： 39.984060,116.307520）
  calculateDistance: function () {
    let _this = this
    const {
      startStringIObject,
      endStringIObject
    } = _this.data
    console.log('startStringIObject=====>', startStringIObject)
    console.log('endStringIObject=====>', endStringIObject)

    qqmapsdk.calculateDistance({
      mode: 'driving', //可选值：'driving'（驾车）、'walking'（步行），不填默认：'walking',可不填
      //from参数不填默认当前地址
      //获取表单提交的经纬度并设置from和to参数（示例为string格式）
      from: startStringIObject, //若起点有数据则采用起点坐标，若为空默认当前地址
      to: endStringIObject, //终点坐标
      success: function (res) { //成功后的回调
        console.log('res=====>', res)
        //两点的行车距离
        let distance = res.result.elements[0].distance
        //将单位从米转化为km
        let distance2 = (distance / 1000).toFixed(2)
        _this.setData({
          distance: distance2
        })
      },
      fail: function (error) {
        //用户拒绝定位
        if (error.message == 110) {
          wx.showModal({
            content: '检测到您没打开获取信息功能权限，是否去设置打开？',
            confirmText: "确认",
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
                    console.log('确定');
                  }
                })
              } else {
                console.log('取消');
                return false;
              }
            }
          })
        }
      }
    });
  }



}))