
Page({
  data: {
    value:'',
    acountList:[{
      id:0,
      name:'2020-08 财务统计报表',
      read:false
    },{
      id:0,
      name:'2020-09 财务统计报表',
      read:true
    },{
      id:0,
      name:'2020-10 财务统计报表',
      read:false
    }],
  },
  clickAcount:function(e){
    e = e.currentTarget.dataset.index
    console.log(e)
  },
  clickPop:function(){
    
  },
  //点击跳转
  clickJump:function(ele){
    var e = ele.currentTarget.dataset.index
    console.log(e)
    wx.navigateTo({
      url:'./sheet/sheet'
    })
  }
})