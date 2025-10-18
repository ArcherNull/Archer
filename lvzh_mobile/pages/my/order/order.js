Page({
  data: {
    value: '',
    tagsList: ['全部', '待支付', '支付成功', '已取消'],
    tagIndex: 0,
    tagsList1: ['门店', '设备编号', '时间'],
    tagIndex1: 0,
    popDom: true,
    clickNum: 0,
    chooseAll: false,
    shopList: [{
      id: 0,
      name: '阳江人民医院',
      active: false
    }, {
      id: 1,
      name: '重庆人民医院',
      active: false
    }, {
      id: 2,
      name: '阳江人民医院',
      active: false
    }, ],
    deviceList: [{
      id: 0,
      name: 'GBCB-01C-S012',
      active: false
    }, {
      id: 1,
      name: 'GBCB-01C-S013',
      active: false
    }, {
      id: 2,
      name: 'GBCB-01C-S014',
      active: false
    }],
  },
  search: function (e) {
    console.log(e)
  },
  clickTag: function (e) {
    e = e.detail.e
    console.log(e)
    this.setData({
      tagIndex: e
    })
  },
  clickTag1: function (e) {
    e = e.detail.e
    console.log(e)
    this.setData({
      tagIndex1: e
    })
  },
  openPop: function () {
    this.setData({
      popDom: true,
    })
  },
  closePop: function () {
    this.setData({
      popDom: false
    })
  },
  judge: function () {
    var arr, str
    if (this.data.tagIndex1 == 0) {
      arr = this.data.shopList
      str = 'shopList'
    } else {
      arr = this.data.deviceList
      str = 'deviceList'
    }
    console.log(arr)
    return {
      arr: arr,
      str: str
    }
  },
  judge1: function (arr) {
    if (this.data.tagIndex1 == 0) {
      this.setData({
        shopList: arr
      })
    } else {
      this.setData({
        deviceList: arr
      })
    }
  },
  chooseAll: function (ele) {
    console.log(ele)
    var abc = this.judge()
    console.log(abc)
    var num = 0,
      bool
    var arr = abc.arr
    console.log(arr)
    console.log(ele)
    if (ele == 2) {
      bool = false
    } else {
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
  timePic:function(e){
    e = e.currentTarget.dataset.index
    console.log(e)
  },
})