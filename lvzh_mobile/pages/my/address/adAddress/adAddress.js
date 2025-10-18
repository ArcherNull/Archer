Page({
  data:{
    //设置默认
    setAddr:false,
    //删除收货地址
    delAddr:false,
    // 选中城市
    cityVal:[],
  },
  //设置默认地址
  setBtn:function(){
    this.setData({
      setAddr:!this.data.setAddr
    })
  },
  //删除收货地址
  delAddr:function(){
    console.log('删除收货地址')
  },
  // 选中城市方法
  selectCityFun(ele){
    let val = ele.detail.value
    console.log('val' , val)
    this.setData({
      cityVal : val
    })
  }
})