const app = getApp()
const filter = app.commModule.filter  //路由守卫
Page(filter({
  data:{
    propArray:[{
      id:0,
      text:'圆通(推荐)'
    },{
      id:1,
      text:'申通'
    },{
      id:2,
      text:'顺丰'
    },{
      id:0,
      text:'圆通'
    },{
      id:1,
      text:'申通'
    },{
      id:2,
      text:'顺丰'
    }
  ]
  },
  clickJump:function(){
    console.log("跳转")
    wx.navigateTo({
      url: '../../../address/address',
    })
  }
}))