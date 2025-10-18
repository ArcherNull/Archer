const app = getApp()
const filter = app.commModule.filter  //路由守卫
import dateTime from '../../../common/util.js'
var timeNum = 0 //时间全局变量
Page(filter({
  data: {
    //输入的搜索值
    value: '',
    //日期导航标签
    tagsList: ['今日', '本周', '本月', '半年', '一年'],
    //选中的标签
    tagIndex: 0,
    //医院详情
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
    //当前时间
    today: '',
    //前一天/前一周/前半年/前一年
    dayText: '一天',
    //门店分类的弹窗
    openPop:false,
    //是否显示pop中的搜索框
    search:false,
    //弹窗中的列表
    typeList:[{
      id:0,
      name:'医院',
      active:false,
    },{
      id:1,
      name:'商超',
      active:false,
    },{
      id:2,
      name:'药房',
      active:false,
    },{
      id:3,
      name:'医院',
      active:false,
    },{
      id:4,
      name:'医院',
      active:false,
    }]
  },
  onLoad: function () {
    this.setData({
      today: dateTime.time(new Date()).formatDay
    })
  },
  //搜索
  search: function (e) {
    console.log(e)
  },
  //日期标签
  clickTag: function (e) {
    e = e.detail.e
    timeNum = 0 //选中标签，还原前一天和后一天的状态
    var today = dateTime.time(new Date()).formatDay
    var str, str1
    if (e == 0) {
      //今日
      str = today
      str1 = '一天'
    } else if (e == 1) {
      //本周
      this.getTime(6)
      str1 = '一周'
    } else if (e == 2) {
      //本月
      str = this.getTime(1, 1)
      str1 = '一月'
    } else if (e == 3) {
      //半年
      str = this.getTime(1, 2)
      str1 = '半年'
    } else {
      str = this.getTime(1, 3)
      str1 = "一年"
    }
    this.setData({
      tagIndex: e,
      today: str,
      dayText: str1
    })
  },
  /* 时间设置 */
  getTime: function (n, day, add) {
    var date = new Date()
    var Y = date.getFullYear()
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
    var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
    var today = [Y, M, D].join('/') //今日
    var month = [Y, M].join('/') //本月


    var lastWeek = Date.parse(today) - n * 24 * 60 * 60 * 1000 //前一天
    var lastWeek1 = this.toDates(Date.parse(today) - n * 6 * 24 * 60 * 60 * 1000) //上周
    var lastWeek2 = this.toDates(Date.parse(today) - (n + 1) * 6 * 24 * 60 * 60 * 1000) //上上周
    var week = this.toDates(lastWeek)
    var str = week + '至' + today //本周
    var str1 = lastWeek2 + '至' + lastWeek1 //上周

    var Mon = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1 - n) : date.getMonth() + 1 - n) 
    var str2 = [Y, Mon].join('/') //前一月/后一月

    //前一天/后一天操作按钮
    if (day == 0) {
      if (add == 0) {
        return week ///前一天/后一天
      } else if (add == 1) {
        console.log(str1)
        return str1 //前一周/后一周
      } else if (add == 2) {
        console.log(str2)
        return str2 //前一月/后一月
      }

    }
    //本月
    if (day == 1) {
      return month
    }

    //半年
    if (day == 2) {
      var strmonth
      //上半年
      if (month < 7) {
        strmonth = '2020/01至2020/06'
      } else {
        strmonth = '2020/07至2020/12'
      }
      return strmonth
    }

    //一年
    if (day == 3) {
      return Y
    }

    this.setData({
      today: str
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

  clickJump(e) {
    e = e.currentTarget.dataset.index
    console.log(e)
    if (e == 0) {
      wx.navigateTo({
        url: "./chart/chart"
      })
    }
  },
  //日期操作按钮
  opeartion: function (ele) {
    var e = ele.currentTarget.dataset.index
    console.log(e)
    var str,text
    if (e == 0) {
      timeNum++
      if (this.data.tagIndex == 0) {
        //今日-前一天

        str = this.getTime(timeNum, 0, 0)
      } else if (this.data.tagIndex == 1) {
        //本周-前一周
        str = this.getTime(timeNum, 0, 1)
      } else if (this.data.tagIndex == 2) {
        //本月-前一月
        str = this.getTime(timeNum, 0, 2)
      } else if (this.data.tagIndex == 3) {
        //半年-前半年

      } else if (this.data.tagIndex == 4) {
        //一年-前一年

      }

    } else {
      timeNum--
      if (timeNum >= 0) {
        if (this.data.tagIndex == 0) {
          //今日-后一天
          text = '今日'
          str = this.getTime(timeNum, 0, 0)

        } else if (this.data.tagIndex == 1) {
          //本周-后一周
          text = '本周'
          str = this.getTime(timeNum, 0, 1)
        } else if (this.data.tagIndex == 2) {
          //本周-后一月
          text = '本月'
          str = this.getTime(timeNum, 0, 2)
        } else if (this.data.tagIndex == 3) {
          //本周-后半年
          text = '半年'

        } else if (this.data.tagIndex == 4) {
          //本周-后一年
          text = '今年'
        }
      } else {
        timeNum = 0
        wx.showToast({
          title: '所选时间不能超过当前时间！',
          icon: 'none'
        })
      }
    }
    this.setData({
      today: str
    })
  },
  //底部按钮
  clickBtn: function (ele) {
    var e = ele.currentTarget.dataset.index
    console.log(e)
    if (e == 0) {
      wx.switchTab({
        url: '../index',
      })
    } else if (e == 1) {
      console.log('数据分析')
      wx.navigateTo({
        url: './chart/chart',
      })
    }

  },
  //打开弹窗，门店分类
  openPop:function(){
    this.setData({
      openPop:!this.data.openPop
    })
  },
  // 门店分类的选项
  clickSearch(ele){
    let index = ele.currentTarget.dataset.index
    let bol = this.data.typeList[index].active
    let str = 'typeList[' + index + '].active'
    this.setData({
      [str] : !bol
    })
  }
}))