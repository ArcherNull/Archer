/*
 **通过中间件生成与Vue类似的路由守卫
 */
import common from './common.js'
// 分享的标题
const {
  messageInfoList,
  getRandom,
  language
} = common
const tIndex = getRandom(0, messageInfoList.length - 1)
const title = messageInfoList[tIndex][language]

function loginCheck(pageObj) {
  // 页面初次加载，页面中onLoad生命周期的公共操作
  // console.log('pageObj对象' , pageObj)
  console.log('pageObj-onLoad=====>')

  if (pageObj.onLoad) {
    let _onLoad = pageObj.onLoad;
    // 使用onLoad的话需要传递options
    pageObj.onLoad = function (options) {
      //判断有没有获取到用户信息 wx.getStorageSync('USERID')
      if (true) {
        // 获取当前页面
        let currentInstance = getPageInstance();
        _onLoad.call(currentInstance, options);
      } else {
        //跳转到登录页
        wx.redirectTo({
          url: "/pages/login/login"
        });
      }
    }
  }

  /**
   * @desc 分享朋友圈的功能
   * @param imageUrl 分享的图片路径
   **/
  pageObj.onShareAppMessage = function () {
    console.log('title', title)

    return {
      title,
      path: '/pages/index/index?id=123'
    }
  }

  /**
   * @desc 分享朋友圈
   * @param pathUrl 分享的路径
   **/
  pageObj.onShareTimeline = function () {
    console.log('title', title)
    return {
      title,
      query: {
        key: 'sharMessage'
      },
      // imageUrl:'' // 公众号的素材图片
    }
  }

  // 加入更改系统主题
  pageObj.changeSystemTheme = function (ele) {
    const themeColor = ele.currentTarget.dataset.color
    console.log('加入更改系统主题', themeColor)
    this.setData({
      themeColor
    })

    wx.setNavigationBarColor({
      backgroundColor: themeColor,
      frontColor: '#ffffff',
    })
  }

  // 主题更改
  pageObj.data.themeColor = 'yellowgreen'

  return pageObj;
}

// 获取当前页面 
function getPageInstance() {
  var pages = getCurrentPages();
  return pages[pages.length - 1];
}

exports.loginCheck = loginCheck;