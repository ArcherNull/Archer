
/* 用于采购模块的swiper */
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    navList: {
      type: Array,
      value: [{
        id: 0,
        name: '医疗'
      },{
        id: 0,
        name: '医疗'
      },{
        id: 0,
        name: '医疗疗疗疗疗疗疗疗'
      },{
        id: 0,
        name: '医疗'
      }]
    }
  },
  data: {
    //默认选中
    navIndex:0
  },
  methods: {
    clickNav:function(ele){
      var e = ele.currentTarget.dataset.index
      console.log(e)
      this.setData({
        navIndex: e
      })
    }
  }
})