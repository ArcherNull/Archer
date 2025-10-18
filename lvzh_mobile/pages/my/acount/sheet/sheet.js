Page({

  data: {
    imgs:['https://i.loli.net/2020/10/08/j56s4mxzv2uGrQL.png','https://i.loli.net/2020/10/08/j56s4mxzv2uGrQL.png','https://i.loli.net/2020/10/08/j56s4mxzv2uGrQL.png',],
  },
  clickPreview:function(){
    wx.previewImage({
      current:this.data.imgs[0],
      urls: this.data.imgs,
    })
  },
})