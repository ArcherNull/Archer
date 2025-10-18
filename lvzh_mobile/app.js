const filter = require('./common/routerJump.js') //路由守卫
import common from './common/common.js' //公共方法
import apis from './server/api.js'
import dateTime from './common/util.js' //日期函数
import manageConfig from './data/manageConfig.js' // 权限控制
import sdk from './sdk/index.js'

const callback = () => {
  wx.switchTab({
    url: '/pages/index/index',
  })
}

App({
  // 小程序初始化完成时触发，全局只触发一次。参数也可以使用 wx.getLaunchOptionsSync 获取
  onLaunch: function () {
    // 获取相应的设备信息
    this.getSystemInfo()

    // 检查小程序版本兼容的问题
    this.checkUpdateVersion()

    // 全局消息通知
    // this.messageAlert()

    // 全局广告展示

  },
  // 此处可以使用webscoket断开重连 ，小程序启动，或从后台进入前台显示时触发。也可以使用 wx.onAppShow 绑定监听
  onShow: function () {

  },

  // 小程序从前台进入后台时触发。也可以使用 wx.onAppHide 绑定监听
  onHide: function () {

  },

  // 小程序发生脚本错误或 API 调用报错时触发。也可以使用 wx.onError 绑定监听
  onError: function (error) {
    console.log('小程序发生脚本错误或 API 调用报错时触发', error)
  },

  // 小程序要打开的页面不存在时触发。也可以使用 wx.onPageNotFound 绑定监听
  onPageNotFound: function (error) {
    console.log('小程序要打开的页面不存在时触发', error)
    common.showMsg('当前页面不存在，稍后我们将跳转至首页')
    setTimeout(() => {
      callback()
    }, 2000);
  },

  // onUnhandledRejection监听未处理的 Promise reject拒绝事件监听函数 , 同wx.onUnhandledRejection(function callback)  【注意】安卓平台暂时不支持该事件
  onUnhandledRejection: function (error) {
    console.log('处理的 Promise reject拒绝事件监听函数', error)
  },

  // 系统主题发生变化 ， 同 wx.onThemeChange() API  系统主题主要存在两种 dark / light
  onThemeChange: function (params) {

  },

  globalData: {
    validateCode: '', // 验证码
    //获取手机信息
    phoneInfo: {
      statusBarHeight: 0, //顶部导航栏的高度
      screenHeight: 0, //屏幕高度
      screenWidth: 0, //屏幕宽度
      isPhoneX: false, //判断是否有刘海屏的iphoneX
    },
    //获取用户信息
    userInfo: {},
  },
  //监听器
  commFun: {
    //设置监听器
    setWatcher(page) {
      let data = page.data; // 获取page 页面data
      let watch = page.watch;
      for (let i in watch) {
        let key = i.split('.'); // 将watch中的属性以'.'切分成数组
        let nowData = data; // 将data赋值给nowData
        let lastKey = key[key.length - 1];
        let watchFun = watch[i].handler || watch[i]; // 兼容带handler和不带handler的两种写法
        let deep = watch[i].deep; // 若未设置deep,则为undefine
        this.observe(nowData, lastKey, watchFun, deep, page); // 监听nowData对象的lastKey
      }
    },
    //监听改变值
    observe(obj, key, watchFun, deep, page) {
      let val = obj[key];
      let that = this;
      // 判断deep是true 且 val不能为空 且 typeof val==='object'（数组内数值变化也需要深度监听）
      if (deep && val != null && typeof val === 'object') {
        for (let i in val) {
          this.observe(val, i, watchFun, deep, page); // 递归调用监听函数
        }
      }

      Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: true,
        set: function (value) {
          // 用page对象调用,改变函数内this指向,以便this.data访问data内的属性值
          watchFun.call(page, value, val); // value是新值，val是旧值
          val = value;
          if (deep) { // 若是深度监听,重新监听该对象，以便监听其属性。
            that.observe(obj, key, watchFun, deep, page);
          }
        },
        get: function () {
          return val;
        }
      })
    },
  },

  //公共模块
  commModule: {
    filter: filter.loginCheck, //路由守卫
    common, //公共方法
    dateTime, //日期函数
    manageConfig, // 权限
    apis, // 接口
    sdk // 工具包集成
  },

  /**
   * @desc 检测当前的小程序，是否是最新版本，是否需要下载、更新
   */
  checkUpdateVersion: function () {
    console.log('检查小程序兼容问题')
    //判断微信版本是否 兼容小程序更新机制API的使用
    if (wx.canIUse('getUpdateManager')) {
      //创建 UpdateManager 实例
      const updateManager = wx.getUpdateManager();
      //检测版本更新
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          //监听小程序有版本更新事件
          updateManager.onUpdateReady(function () {
            //TODO 新的版本已经下载好，调用 applyUpdate 应用新版本并重启 （ 此处进行了自动更新操作）
            updateManager.applyUpdate();
          })
          updateManager.onUpdateFailed(function () {
            // 新版本下载失败
            wx.showModal({
              title: '已经有新版本喽~',
              content: '请您删除当前小程序，到微信 “发现-小程序” 页，重新搜索打开哦~',
            })
          })
        }
      })
    } else {
      //TODO 此时微信版本太低（一般而言版本都是支持的）
      wx.showModal({
        title: '溫馨提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },

  /**
   * @desc 获取相应的设备信息
   */
  getSystemInfo() {
    //获取手机设备信息
    wx.getSystemInfo({
      success: (res) => {
        const that = this
        console.log('手机信息' + res.model)
        const {
          statusBarHeight,
          screenHeight,
          screenWidth,
          modelmes
        } = res
        // 检验排除具有刘海屏的iPhone手机
        const checkArr = ['iPhone X', 'iPhone 11', 'iPhone XR', 'iPhone XS Max']
        const isPhoneX = checkArr.includes(modelmes)
        that.globalData.phoneInfo = {
          statusBarHeight,
          screenHeight,
          screenWidth,
          modelmes,
          isPhoneX
        }
      },
    })
  },

  /**
   * @desc 路由监控
   */
  routerMonitor() {
    console.log('路由监控')
    // 全局分享
    wx.onAppRoute(() => {
      let pages = getCurrentPages();
      let curPage = pages[pages.length - 1];
      console.log('page stack changed', curPage);

      // 此方法可劫持分享功能的分享内容，但是做不了页面全局分享功能的添加。全局添加页面全局分享功能方法
      // 位于 /common/routerJump
      curPage.onShareAppMessage = function () {
        return {
          title: '自定义转发标题123123123',
          path: '/pages/index/index?id=123'
        }
      }

      // 此方法可劫持分享功能的分享内容，但是做不了页面全局分享功能的添加
      curPage.onShareTimeline = function () {
        return {
          title: '后台管理系统小程序',
          query: {
            key: 'sharMessage'
          },
          // imageUrl:'' // 公众号的素材图片
        }
      }
    });
  },

  /**
   * @desc 全局消息通知
   * @param time 时长，单位分钟， 默认 5分钟一次
   */
  messageAlert(time = 0.5) {
    const that = this
    let interval = null
    let timeout = time * 60
    const setInterVal = (interval, timeout) => {
      let timeNum = timeout
      if (!interval) {
        // console.log('此处请求发送验证码接口')
        interval = setInterval(() => {
          if (timeNum <= 1) {
            clearInterval(interval)
            setTimeout(() => {
              console.log('获取到重要信息是否前去查看')
              common.showModal('系统版本更新v1.2.0，是否去查看新功能', '消息提示', callback)
            });
          }
          timeNum--
          console.log('剩余时间', timeNum)
        }, 1000)
      } else {
        console.log('定时器计时')
      }
    }
    setInterVal(interval, timeout)
  }
})