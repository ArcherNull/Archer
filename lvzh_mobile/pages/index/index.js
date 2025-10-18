const app = getApp()
const filter = app.commModule.filter //路由守卫

Page(filter({
  data: {
    themeColor: 'yellowgreen',
    //日期弹窗显示开关
    showDom: false,
    tagValue: '',
    loading: false, // 加载loading
    tagsList: [{
      id: 0,
      text: '今日'
    }, {
      id: 1,
      text: '昨日'
    }, {
      id: 2,
      text: '本周'
    }, {
      id: 3,
      text: '本月'
    }, ],
    // 收益项列表
    profitList: [{
      id: 0,
      title: '袋子收益(元)',
      orderNum: 10,
      number: '88.88'
    }, {
      id: 0,
      title: '广告收益(元)',
      orderNum: 0,
      number: '13000.05'
    }, {
      id: 0,
      title: '商品收益(元)',
      orderNum: 0,
      number: '1.00'
    }],
    // 通知栏
    indexSwiper: app.commModule.common.messageInfoList,
    // 当日收益统计
    bagList: [{
      id: 0,
      title: '袋子使用量(个)',
      number: 13000
    }, {
      id: 0,
      title: '广告投放(个)',
      number: 13000
    }, {
      id: 0,
      title: '商品成交数(个)',
      number: 13000
    }],
    // 功能模块
    funList: [{
      id: 0,
      name: '设备管理',
      img: '../../static/index_1.png',
      totalDevice: 8,
      online: 4,
      subText: '在线'
    }, {
      id: 1,
      name: '经营统计',
      img: '../../static/index_3.png',
      subText: '经营数据统计'
    }, {
      id: 1,
      name: '地图',
      img: '../../static/index_3.png',
      subText: '地图/定位等应用'
    }, {
      id: 1,
      name: '电影院座位',
      img: '../../static/index_3.png',
      subText: '电影院选座位'
    }, {
      id: 1,
      name: '数据加解密',
      img: '../../static/index_3.png',
      subText: 'sha1/md5加密'
    }, {
      id: 1,
      name: 'canvas画布应用',
      img: '../../static/index_3.png',
      subText: '海报/画板/剪裁图片等'
    }, {
      id: 1,
      name: 'Qrcode二维码',
      img: '../../static/index_3.png',
      subText: 'Qrcode二维码'
    }, {
      id: 1,
      name: '证件识别',
      img: '../../static/index_3.png',
      subText: '证件识别'
    }, {
      id: 1,
      name: '扫码',
      img: '../../static/index_3.png',
      subText: '扫码'
    }, {
      id: 1,
      name: '下拉刷新',
      img: '../../static/index_3.png',
      subText: '下拉刷新'
    }, {
      id: 1,
      name: '音/视频',
      img: '../../static/index_3.png',
      subText: '音频/视频'
    }, {
      id: 1,
      name: '统计图表',
      img: '../../static/index_3.png',
      subText: '环形进度条图表'
    }]
  },
  onLoad: function () {
    console.log('onLoad=====>')
    this.setData({
      tagValue: this.data.tagsList[0].text,
      loading: true
    })
    this.getIndexData()
  },
  // 获取首页数据
  getIndexData() {
    let that = this

    setTimeout(() => {
      that.setData({
        loading: false
      })
    }, 400);
  },
  //日期开关显示和隐藏
  clickOne: function () {
    this.setData({
      showDom: !this.data.showDom
    })
  },
  //选择日期弹框中的标签
  clickTag: function (ele) {
    var item = ele.detail
    var tagValue = item.text
    this.setData({
      tagValue: tagValue,
      showDom: false
    })
  },
  // 点击透明蒙层，关闭日期弹框
  closeIndexDate() {
    this.setData({
      showDom: !this.data.showDom
    })
  },
  //主要功能跳转
  clickJump(ele) {
    let item = ele.currentTarget.dataset.item
    switch (item.name) {
      case '设备管理':
        console.log('设备管理')
        wx.navigateTo({
          url: "./device/device"
        })
        break;
      case '经营统计':
        console.log('经营统计')
        wx.navigateTo({
          url: "./statistics/statistics"
        })
        break;
      case '地图':
        console.log('地图')
        wx.navigateTo({
          url: '/pages/index/map/map',
        })
        break;
      case '电影院座位':
        console.log('电影院座位')
        app.commModule.common.showMsg('该功能暂未开放！')
        break;
      case '数据加解密':
        console.log('数据加解密')
        wx.navigateTo({
          url: '/pages/index/ciphertext/ciphertext',
        })
        break;
      case 'canvas画布应用':
        console.log('canvas画布应用')
        wx.navigateTo({
          url: '/pages/index/canvas/canvas',
        })
        // app.commModule.common.showMsg('该功能暂未开放！')
        break;
      case 'Qrcode二维码':
        console.log('Qrcode二维码')
        wx.navigateTo({
          url: '/pages/index/QrCode/QrCode',
        })
        break
      case '证件识别':
        console.log('证件识别')
        wx.navigateTo({
          url: '/pages/index/qcr/qcr',
        })
        break
      case '扫码':
        console.log('扫码')
        wx.scanCode({
          success(res) {
            console.log(res)
            app.commModule.common.showMsg(res.result || '扫码出错')
          }
        })
        break

      case '下拉刷新':
        console.log('下拉刷新')
        wx.navigateTo({
          url: '/pages/index/refresh/index',
        })
        break

      case '音/视频':
        console.log('音/视频')
        wx.navigateTo({
          url: '/pages/index/videoAndVoice/index',
        })
        break

        case '统计图表':
          console.log('统计图表')
          wx.navigateTo({
            url: '/pages/index/statistics/chart/chart',
          })
          break
    }
  },
}))