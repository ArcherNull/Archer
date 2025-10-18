const app = getApp()
const filter = app.commModule.filter  //路由守卫

Page(filter({
  data: {
    value: '',
    deviceList: [{
      id: 0,
      name: 'GBCB-010C_阳江人民医院',
      title: '环保袋设备',
      storage: 113
    }, {
      id: 0,
      name: 'GBCB-010C_阳江人民医院',
      title: '环保袋设备',
      storage: 113
    }, {
      id: 0,
      name: 'GBCB-010C_阳江人民医院',
      title: '环保袋设备',
      storage: 113
    }],
    deviceList1: [{
      id: 0,
      name: 'GBCB-015C_淮安开发区人民医院',
      title: '环保袋设备',
      storage: 113
    }],
    searchList: [{
      id: 0,
      name: '阳江人民医院',
      active: false
    }, {
      id: 1,
      name: '阳江人民医院',
      active: false
    }, {
      id: 2,
      name: '阳江人民医院',
      active: false
    }],
    tagsList: [{
      id: 0,
      name: '医院',
      active: false
    }, {
      id: 1,
      name: '商超',
      active: false
    }, {
      id: 2,
      name: '其他',
      active: false
    }],
    lineList: [{
      id: 0,
      name: '在线',
      active: false
    }, {
      id: 1,
      name: '离线',
      active: false
    }, ],
    chooseAll: false,
    clickType: 0,
    popHeader: true,
    clickNum: 0,
    popDom: false,
  },
  search: function (e) {
    e = e.detail.a
    console.log(e)
  },
  clickDev: function (e) {
    e = e.currentTarget.dataset.index
    console.log(e)
  },
  judge: function () {
    var arr, str
    if (this.data.clickType == 0) {
      arr = this.data.searchList
      str = 'searchList'
    } else if (!this.data.popHeader) {
      arr = this.data.lineList
      str = 'lineList'
    } else {
      arr = this.data.tagsList
      str = 'tagsList'
    }
    return {
      arr: arr,
      str: str
    }
  },
  judge1: function (arr) {
    if (this.data.clickType == 0) {
      this.setData({
        searchList: arr
      })
    } else if (!this.data.popHeader) {
      this.setData({
        lineList: arr
      })
    } else {
      this.setData({
        tagsList: arr
      })
    }
  },
  chooseAll: function (ele) {
    var abc = this.judge()
    var num = 0,bool
    var arr = abc.arr
    console.log(ele)
    if(ele == 2){
      bool = false
    }else{
      bool = !this.data.chooseAll
    }
    arr.forEach(ele => {
      return ele.active = bool
    })
    this.judge1(arr)
    if (bool) {
      num = arr.length
    }
    this.setData({
      chooseAll: bool,
      clickNum: num
    })
  },
  //单选按钮
  clickSearch: function (e) {
    e = e.currentTarget.dataset.index
    var abc = this.judge()
    var arr = abc.arr
    var str1 = abc.str
    var bool = !arr[e].active
    var str = str1 + '[' + e + '].active'
    this.setData({
      [str]: bool
    })
    var cbool = arr.some((ele) => {
      return (ele.active == false)
    })
    var i = 0
    arr.forEach(ele => {
      if (ele.active) {
        i++
      }
      return i
    })
    //console.log(cbool)
    var b = !cbool
    this.setData({
      chooseAll: b,
      clickNum: i
    })
  },
  //打开弹窗
  clickTag: function (e) {
    this.chooseAll(2)
    e = e.currentTarget.dataset.index
    console.log(e)
    this.setData({
      popDom: !this.data.popDom,
    })
    if (e == 0) {
      this.setData({
        clickType: 0,
        popHeader: true,
      })
    } else if (e == 1) {
      this.setData({
        clickType: 1,
        popHeader: true,
      })
    } else {
      this.setData({
        clickType: 1,
        popHeader: false,
      })
    }
  },
  closePop: function () {
    this.setData({
      popDom:false
    })
  },
  //点击列表单项跳转
  clickDev(e){
    e = e.currentTarget.dataset.index
    console.log(e)
    wx.navigateTo({
      url: "./detail/detail?id=" + e
    })
  }
}))