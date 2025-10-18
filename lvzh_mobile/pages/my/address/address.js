Page({
  data:{
    loading:false ,  // 加载更多
    addrList:[
      {
        id:0,
        name:'陈XX',
        phone:'12345678910',
        addr:'深圳市 福田区 上梅林卓悦城1圳市 福田区 上梅林卓悦城1圳市 福田区 上梅林卓悦城1期铁口1圳市 福田区上梅林卓悦城1期',
        isDefault:true, // 是否是默认值
        idEdit:true // 是否可编辑
      },
      {
        id:0,
        name:'陈XX',
        phone:'12345678910',
        addr:'深圳市 福田区 上梅林卓悦城1圳市 福田区 上梅林卓悦城1圳市 福田区 上梅林卓悦城1期铁口1圳市 福田区上梅林卓悦城1期',
        isDefault:false, // 是否是默认值
        idEdit:true // 是否可编辑
      }
    ]
  },
  //点击编辑
  clickTagFun:function(ele){
    let item = ele.detail
    console.log('选中地址的item'  , item)
  },
  //添加地址
  addAddr:function(){
    wx.navigateTo({
      url: './adAddress/adAddress',
    })
  },
})