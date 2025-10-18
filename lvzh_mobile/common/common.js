/**
 * 公共方法
 * Null
 * 2021/09/06
 */

const common = {
  phone: '12345678910', // 获取到的用户电话
  longitude: '114.05956', // 经度
  latitude: '22.54286', // 维度
  is_checkSession: null, // 判断登录是否在有效期内
  cityName: '深圳市', // 定位城市和选择城市
  AppID: 'wx292f3fb611f34174 ', // 项目的APPID【测试用】
  AppSecret: '6d645610898696c95316ca07f83144be', // 项目的AppSecret【测试用】

  language: 'zh', // 使用语言 ， zh 为中文， en为英文
  // 通知栏
  messageInfoList: [{
      zh: '时间是一切财富中最宝贵的财富',
      en: 'Time is the most precious of all wealth'
    },
    {
      zh: '当你足够强大的时候，你的存在才不容忽视',
      en: 'When you are strong enough, your existence can not be ignored'
    },
    {
      zh: '逆境造就能人',
      en: 'Bad times make a good man'
    },
    {
      zh: '求知无坦途',
      en: 'There is no royal road to learning'
    },
    {
      zh: '怀疑是知识的钥匙',
      en: 'Doubt is the key to knowledge'
    },
    {
      zh: '生活若无波折险阻，就会过于平淡无奇',
      en: 'Life would be too smooth if it had no rubs in it'
    },
    {
      zh: '人生像一匹马，你不驾驭它,它便驾驭你',
      en: 'Life is a horse, and either you ride it or it rides you'
    },
    {
      zh: '心灵最高尚的人，也总是最勇敢的人',
      en: 'The best hearts are always the bravest'
    }
  ],

  /**
   * @description: 生成指定范围内的随机数
   * @param { 最小值  ，Number } min
   * @param { 最大值  ，Number } max
   * @return { 返回min--max区间范围的值 }
   */
  getRandom(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  /**
   * @description: 消息提示
   * @param {提示文本  , string}  text
   * @param {提示icon  , string[] , 'none'/'success'/'error'}  icon
   */
  showMsg: function (title, icon = 'none', duration = 2000) {
    wx.showToast({
      title,
      icon,
      duration,
    })
  },

  /**
   * @description: 弹窗提示模板
   * @param {消息弹窗的文本  , string}  text
   * @param {消息弹窗的标题  , string}  title
   * @param {确认成功的回调函数  , function}  callback
   */
  showModal: function (text, title, callback) {
    wx.showModal({
      content: text,
      title: title,
      success(res) {
        res.confirm && typeof callback === 'function' && callback(true)
      }
    })
  },

  /**
   * @description: 预览图片
   * @param {查看的图片数组  , string[]}  imgs
   * @param {查看当前的第几张图片  , string}  currentUrl
   */
  previewImgs: function (imgs, currentUrl) {
    wx.previewImage({
      urls: imgs,
      current: currentUrl
    })
  },

  /**
   * @description: 拨打电话
   * @param {电话号码  , string[]}  phone
   */
  makePhoneCall: function (phone) {
    let that = this
    wx.makePhoneCall({
      phoneNumber: phone || that.phone,
    })
  },

  /**
   * @description: 获取设备信息
   * @return { object }  设备信息
   */
  getSystemInfo: function () {
    return new Promise((resolve, reject) => {
      wx.getSystemInfo({
        success(res) {
          resolve(res)
        },
        fail(res) {
          reject(res)
        }
      })
    })
  },

  /**
   * @description: 文本复制
   * @param {要复制的文本  , string}  data
   */
  copyText(data) {
    const that = this
    wx.setClipboardData({
      data,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data) // data
            that.showMsg('复制成功', 'success')
          },
          fail(res) {
            that.showMsg('复制失败')
          }
        })
      }
    })
  },

  /**
   * @desc 获取code,一般用于通过拿取code,再床给后端，后端在登录接口保存解析用户信息返给前端，此时也可以放回解析好的手机号
   **/
  wxLogin: function () {
    return new Promise((resolve, reject) => {
      wx.login({
        provider: 'weixin',
        success: function (loginRes) {
          if (loginRes.errMsg == 'login:ok') {
            resolve(loginRes.code)
          } else {
            that.showMsg('code获取异常，登录无法完成！');
          }
        },
        fail(res) {
          that.showMsg('code获取失败!');
          reject(res)
        }
      });
    })
  },

  /**
   * @desc 每次获取用户的微信用户信息时，都需要弹出授权弹窗信息给用户确认，才能获取到准确的信息，相比于wx.getUserInfo()获取信息更加全面
   **/
  getuserinfo: function () {
    let that = this
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        lang: 'zh_CN',
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log('获取用户信息', res)
          resolve(res)
        },
        fail: (res) => {
          that.showMsg('获取用户信息失败！')
        }
      })
    })
  },

  /**
   * @desc 检查session_key是否有效，一般用于登录过期等，code失效或者前端解析手机号等
   **/
  checkSession: function () {
    return new Promise((resolve, reject) => {
      wx.checkSession({
        success: (res) => {
          console.log('检测session_key登录状态', res);
          if (res.errMsg == 'checkSession:ok') {
            resolve(true)
          }
        },
        fail: (res) => {
          reject(false)
        },
      })
    })
  },

  /**
   * @desc 格式化时间
   * @param data 事件戳，一般传入 new Date(),即可获取当前时间年月日时分秒
   **/
  formatTime: date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    const formatNumber = n => {
      n = n.toString()
      return n[1] ? n : '0' + n
    }

    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  },

  /**
   * @desc 函数防抖---"立即执行版本" 和 "非立即执行版本" 的组合版本
   * @param func 需要执行的函数
   * @param wait 延迟执行时间（毫秒）
   * @param immediate---true 表立即执行，false 表非立即执行(默认)
   **/
  debounce(func, wait, immediate) {
    let timer;
    return function () {
      let that = this;
      let args = arguments;
      if (timer) clearTimeout(timer);
      // 立即执行
      if (immediate) {
        var callNow = !timer;
        timer = setTimeout(() => {
          timer = null;
        }, wait)
        if (callNow) func.apply(that, args)
      } else {
        // 非立即执行
        timer = setTimeout(function () {
          func.apply(that, args)
        }, wait);
      }
    }
  },

  /**
   * @desc 函数节流
   * @param func 需要执行的函数
   * @param delay 规定时间内不再触发(毫秒)
   **/
  throttle(func, delay) {
    let oldDate = Date.now()
    return function () {
      let that = this
      let args = arguments
      let newDate = Date.now()
      if (newDate - oldDate > delay) {
        func.apply(that, args)
        oldDate = Date.now()
      }
    }
  },

  /**
   * @description: 小数点后两位校验
   * @param {输入金额值}  value
   * @return {输入0.213，例如输出0.21}
   */
  valueConfirm(value) {
    var percentage
    if (/^(\d?)+(\.\d{0,2})?$/.test(value)) { //正则验证，小数点后不能大于两位数字
      percentage = value;
    } else {
      percentage = value.substring(0, value.length - 1);
    }
    return percentage
  },

  /**
   * @description: 使用正则表达式，将中间的4位数变为 *
   * @param {输入的手机号}  mobile
   * @return {返回不可见加密的手机号，例如输入mobile为"131 0000 8080" ，返回131****8080}
   */
  convertMobile(mobile) {
    const mobileReg = /(\d{3})(\d{4})(\d{4})/ig;
    let mobileCalc = mobile.replace(/\s+/ig, "");
    mobileCalc = mobileCalc.replace(mobileReg, "$1****$3");
    return mobileCalc;
  },

  /**
   * @description: 获取access_token,用于证件识别.【注意该APPID和AppSecret需要后端保存并提供，不可放置前端导致风险加大,另外一个识别不了https的图片，只能识别http图片。】
   * @param {string}  AppID 小程序的appID
   * @param {string}  AppSecret 小程序的AppSecret
   * @return {string} 获取access_token
   */
  getAccessToken(AppID = this.AppID, AppSecret = this.AppSecret) {
    return new Promise((resolve, reject) => {
      wx.request({
        method: 'get',
        url: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${AppID}&secret=${AppSecret}`,
        success(res) {
          if (res.errMsg === "request:ok") {
            resolve(res.data)
          } else {
            wx.showToast({
              title: '获取access_token失败！',
              icon: 'none'
            })
          }
        },
        fail(res) {
          wx.showToast({
            title: '获取access_token失败！',
            icon: 'none'
          })
          reject(res)
        }
      })
    })
  },

  /* 身份证---正反面 */
  // 正面：  http://3pl.dekuncn.com//upload/2021-12-22/20211222030944214AH90TN8.jpg
  // 反面:   http://3pl.dekuncn.com//upload/2021-12-15/2021121504002872RJBKDEFO.jpg

  /* 驾驶证 */
  // http://3pl.dekuncn.com//upload/2021-12-22/2021122203124441CS8EOW7P.jpg

  /* 行驶证 */
  // http://3pl.dekuncn.com//upload/2021-12-22/2021122203123967IT9U0XBO.jpg

  /* 银行卡 */
  // http://3pl.dekuncn.com//upload/2021-12-22/2021122203435670RVNIITYN.jpg


  /**
   * @description: 微信小程序服务端api调用识别身份证
   * 官方文档：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/ocr/ocr.idcard.html
   * @param {string}  accessToken 生成的accessToken
   * @param {string}  type 识别的证件类型， bankcard ：银行卡号； bizlicense：营业执照OCR识别； drivinglicense:驾驶证 OCR 识别; :身份证 OCR 识别;comm :小程序的通用印刷体 OCR 识别; driving:程序的行驶证 OCR 识别
   * @param {string}  img_url  要检测的图片 url，传这个则不用传 img 参数。  上传到服务器转成链接图片的识别
   * @param {FormData}  img  form-data 中媒体文件标识，有filename、filelength、content-type等信息，传这个则不用传 img_url。 本地文件识别【按道理来说这个是比较合理的】
   * @return {} 识别结果
   */
  QCRCheckImg(accessToken, img_url, type = 'idcard') {
    return new Promise((resolve, reject) => {
      wx.request({
        method: 'post',
        url: `https://api.weixin.qq.com/cv/ocr/${type}?type=MODE&img_url=${img_url}&access_token=${accessToken}`,
        success(res) {
          console.log('识别证件', res)
          if (res.errMsg === "request:ok") {
            resolve(res.data)
          } else {
            wx.showToast({
              title: '获取access_token失败！',
              icon: 'none'
            })
          }
        },
        fail(res) {
          wx.showToast({
            title: '获取access_token失败！',
            icon: 'none'
          })
          reject(res)
        }
      })
    })
  },

  async QCRCheckImgFun(img_url, type) {
    const that = this
    const aToken = await that.getAccessToken(that.AppID, that.AppSecret)
    const result = await that.QCRCheckImg(aToken, img_url, type)
    console.log('result', result)
    return result
  },

  /**
   * @description: 对象中的null转为空字符串
   * @param {对象}  data
   * @return {清空null字符串}
   */
  nullToStr(data) {
    for (var x in data) {
      if (data[x] == null) { // 如果是null 把直接内容转为 ''
        data[x] = '';
      } else {
        if (Array.isArray(data[x])) { // 是数组遍历数组 递归继续处理
          data[x] = data[x].map(z => {
            return nullToStr(z);
          });
        }
        if (typeof (data[x]) === 'object') { // 是json 递归继续处理
          data[x] = nullToStr(data[x])
        }
      }
    }
    return data;
  },

  /**
   * @description: getSetting只有微信小程序支持，地理位置授权，如果用户取消授权，可再次调用起授权
   */
  getSetting: function () {
    let that = this
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) { //非初始化进入该页面,且未授权
            wx.showModal({
              title: '是否授权当前位置',
              content: '需要获取您的地理位置，请确认授权，否则无法获取您所需数据',
              success: function (res) {
                if (res.cancel) {
                  that.showMsg('授权失败')
                  resolve(false)
                }
                if (res.confirm) {
                  wx.openSetting({
                    success: function (res) {
                      if (res.authSetting["scope.userLocation"] == true) {
                        that.showMsg('授权成功', 'success')
                        //再次授权，调用getLocationt的API
                        // that.getLocation();
                        resolve(true)
                      } else {
                        that.showMsg('授权失败')
                        resolve(false)
                      }
                    }
                  })
                }
              }
            })
          } else if (res.authSetting['scope.userLocation'] == undefined) { //初始化进入
            resolve(true)
          } else {
            //授权后默认加载
            resolve(true)
          }
        }
      })
    })
  },

  /**
   * @description: 获取当前地理定位
   */
  getLocation: function () {
    let that = this;
    return new Promise((resolve, reject) => {
      console.log('定位用户当前位置')
      wx.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        success: function (res) {
          // 为了是将调用重新定位的经纬度存放在commJs中
          that.longitude = res.longitude;
          that.latitude = res.latitude;
          resolve(res)
        },
        fail: function (err) {
          console.log('调用失败', err);
          that.showMsg('定位失败，请检查网络,GPS定位是否开启以及微信地理位置授权等情况')
          reject(false)
        }
      });
    })
  },

  /**
   * @description: 微信小程序的选择附近的地址
   */
  chooseLocation: function () {
    let that = this
    return new Promise((resolve, reject) => {
      wx.chooseLocation({
        success: function (res) {
          resolve(res)
        },
        fail: function (res) {
          that.showMsg('获取附近地址失败！请检查网络,GPS定位是否开启以及微信地理位置授权等情况！')
        }
      });

    })
  },

  /**
   * @description: 打开地图，可选择附近地点/或者搜索地点
   */
  openLocation: function (data) {
    let that = this
    console.log(data)
    return new Promise((resolve, reject) => {
      wx.openLocation({
        longitude: data.longitude,
        latitude: data.latitude,
        success() {
          resolve(true)
        },
        fail() {
          that.showMsg('打开地图导航失败！')
        }
      })

    })
  },

  /**
   * @description: 监听网络发生变化
   */
  netWork: function () {
    let that = this
    return new Promise((resolve, reject) => {
      wx.getNetworkType({
        success: function (res) {
          console.log(res.networkType == 'none');
          if (res.networkType != 'none') {
            resolve(true)
          } else {
            that.showMsg('当前无网络')
            resolve(false)
          }
        }
      });
    })
  },

  /**
   * @description: 比较两个时间的大小
   * @param {开始时间}  startTime
   * @param {结束时间}  endtime
   * @return {返回Boolean值，返回true，表示开始时间小于结束时间}
   */
  compareTime: function (startTime, endtime) {
    let that = this
    if (Date.parse(endtime) - Date.parse(startTime) < 0) {
      that.showMsg('开始时间不能大于结束时间！')
      return false
    } else {
      return true
    }
  },

  /**
   * @description: 扫码
   */
  scanCode: function () {
    return new Promise((resolve, reject) => {
      wx.scanCode({
        scanType: ['barCode', 'qrCode'],
        success: (res) => {
          console.log('扫码成功获取到的', res)
          resolve(res)
        },
        fail: (res) => {
          reject(res)
        },
      })
    })
  },

  /**
   * @description: 使用腾讯位置服务qqmapsdk.reverseGeocoder解析经纬度，使用经纬度解析出当前地理位置文字信息
   * @param {腾讯位置服务实例}  qqmapsdk
   * @param {经度}  longitude
   * @param {纬度}  latitude
   * @return {获取  province：省； city:市；  district:区 等 }
   **/
  getCurrentLocation: function (qqmapsdk, data) {
    let that = this;
    return new Promise((resolve, reject) => {
      qqmapsdk.reverseGeocoder({
        location: {
          latitude: data.latitude || that.latitude,
          longitude: data.longitude || that.longitude
        },
        success: function (res) {
          console.log('调用res', res)
          if (res.message == 'query ok') {
            let result = res.result.ad_info;
            that.cityName = result.city;
            resolve(res)
          } else {
            that.showMsg('获取当前地点位置失败！');
          }
        },
        fail: function (res) {
          reject(false)
          that.showMsg('qqmapsdk.reverseGeocoder方法获取当前地点位置失败！');
        }
      });
    })
  },
  /**
   * @description: 调用地址解析接口
   * @param {腾讯位置服务实例}  qqmapsdk
   * @param {关键词}  cityName
   * @return {经纬度 等 }
   **/
  getAddress: function (qqmapsdk, cityName) {
    let that = this
    return new Promise((resolve, reject) => {
      //调用地址解析接口
      qqmapsdk.geocoder({
        //获取表单传入地址
        address: cityName, //地址参数，例：固定地址，address: '北京市海淀区彩和坊路海淀西大街74号'
        success: function (res) { //成功后的回调
          console.log('调用地址解析接口', res);
          let resObj = res.result.location;
          that.latitude = resObj.lat
          that.longitude = resObj.lng
          resolve(resObj)
        },
        fail: function (error) {
          reject(false)
          that.showMsg('qqmapsdk.geocoder方法解析地址经纬度失败！');
        }
      })
    })
  },

  /**
   * @description: 支付函数
   * @param {支付参数，详见 https://developers.weixin.qq.com/miniprogram/dev/api/payment/wx.requestPayment.html}  data
   * @return {经纬度 等 }
   **/
  setwxPay(that, data) {
    return new Promise((resolve, reject) => {
      // 小程序支付
      wx.requestPayment({
        timeStamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        signType: data.signType,
        paySign: data.paySign,
        success(res) {
          console.log(res)
          // 支付成功
          resolve(true)
        },
        fail(res) {
          console.log(res)
          // 支付失败
          resolve(false)
        }
      })
    })
  },
}



export default common