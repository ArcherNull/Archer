const app = getApp()
const filter = app.commModule.filter  //路由守卫
Page(filter({
  data: {
    img: ['https://i.loli.net/2020/10/07/bfXNyZHFCoh4SRj.png'],
    tags: [{
      name: '常用设置',
      active: true,
      id: 0
    }, {
      name: '在线记录',
      active: false,
      id: 1
    }, {
      name: '操作',
      active: false,
      id: 2
    }],
    textarea:'江苏省常州市丁香路16号(妇幼保健院一楼急诊)',
    arrayList1: [{
      id: 0,
      text: '安丘人民医院'
    }, {
      id: 1,
      text: '阳江人民医院'
    }, {
      id: 2,
      text: '其他'
    }],
    arrayList2: [{
      id: 0,
      text: '医院'
    }, {
      id: 1,
      text: '商超'
    }, {
      id: 2,
      text: '其他'
    }],
    arrayList3: [{
      id: 0,
      text: '环保袋设备'
    }, {
      id: 1,
      text: '货道设备'
    }, {
      id: 2,
      text: '其他'
    }],
    arrayList4: [{
      id: 0,
      text: '2020-08-01'
    }, {
      id: 1,
      text: '2020-08-02'
    }, {
      id: 2,
      text: '其他'
    }],
    lineList:[{
      id: 0,
      line: '在线',
      time:'2020-08-16 07:17:28'
    }, {
      id: 1,
      line: '离线',
      time:'2020-08-16 07:17:28'
    }, ]
  },
  onLoad:function(){
    console.log('')
  },
  clickPreview: function () {
    wx.previewImage({
      current: this.data.img[0],
      urls: this.data.img,
    })
  },
  clickTag: function (e) {
    e = e.detail.e
    console.log(e)
    var str1 = 'tags[0].active'
    var str2 = 'tags[1].active'
    var str3 = 'tags[2].active'
    if (e == 0) {
      this.setData({
        [str1]: true,
        [str2]: false,
        [str3]: false
      })
    } else if (e == 1) {
      this.setData({
        [str1]: false,
        [str2]: true,
        [str3]: false
      })
    } else {
      this.setData({
        [str1]: false,
        [str2]: false,
        [str3]: true
      })
    }
  },
  clickSubmit:function(e){
    e = e.currentTarget.dataset.index
    console.log(e)
  },
}))