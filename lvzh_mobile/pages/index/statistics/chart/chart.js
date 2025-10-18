const app = getApp()
const { dateTime ,  filter } = app.commModule
import Canvas from "../../../../common/scrollline.js"

Page(filter({
  // 引入文件的函数 
  ...Canvas.options,
  data: {
    ...Canvas.data,
    value: '',
    tagsList: ['近1周', '近1月', '近3月', '近6月', '近1年'],
    tagIndex: 0,
    selectList: [{
      id: 0,
      text: '全部门店',
    }, {
      id: 1,
      text: '全部门店',
    }, {
      id: 2,
      text: '全部门店',
    }],
    proDetail: [{
      num: 100.00,
      name: '袋子收入(元)'
    }, {
      num: 100.00,
      name: '袋子收入(元)'
    }, {
      num: 100.00,
      name: '袋子收入(元)'
    }, {
      num: 100.00,
      name: '袋子收入(元)'
    }, {
      num: 100.00,
      name: '袋子收入(元)'
    }, {
      num: 100.00,
      name: '袋子收入(元)'
    }, {
      num: 100.00,
      name: '袋子收入(元)'
    }, {
      num: 100.00,
      name: '袋子收入(元)'
    }, ],
    today: '',
  },
  onLoad: function () {
    this.getRes()
    this.setData({
      today: dateTime.time(new Date()).formatDay
    })
  },
  search: function (e) {
    console.log(e)
  },
  clickTag: function (e) {
    e = e.detail.e
    console.log(e)
    var today = dateTime.time(new Date()).formatDay
    var todayNum = Date.parse(today)
    console.log(todayNum)
    var str, str1
    if (e == 0) {
      this.setData({
        today: today
      })
    } else if (e == 1) {
      this.getTime(1)
    } else if (e == 2) {

    } else if (e == 3) {

    } else {

    }
    this.setData({
      tagIndex: e
    })
  },
  /* 时间设置 */
  //时间转换为时间戳，上一周时间
  getTime: function (n) {
    var date = new Date()
    var Y = date.getFullYear()
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
    var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
    var today = [Y, M, D].join('/')
    //当前天数
    //console.log(today)

    //向前推7天
    var lastWeek = Date.parse(today) - n * 6 * 24 * 60 * 60 * 1000
    var week = this.toDates(lastWeek)
    //console.log(week)
    var str = week + '至' + today
    this.setData({
      today: str,
    })
  },
  //时间戳转换为时间
  toDates: function (times) {
    const date = new Date(times)
    const Y = date.getFullYear()
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
    const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
    const dateTime = [Y, M, D].join('/')
    return dateTime
  },
  //返回首页
  backIndex: function (ele) {
    var index = ele.currentTarget.dataset.index
    console.log(index)
    if (index == 0) {
      wx.switchTab({
        url: '../../../index/index',
      })
    } else {
      console.log('收益列表')
      wx.navigateTo({
        url: '../statistics'
      })
    }
  }
}))