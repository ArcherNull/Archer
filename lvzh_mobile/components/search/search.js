// components/search/search.js
Component({
  options:{
    addGlobalClass:true
  },

  properties: {
    value:{
      type:String,
      value:''
    },
    placeholder:{
      type:String,
      value:'请输入设备编号或备注，可模糊搜索'
    },
    type:{
      type:String,
    }

  },

  data: {
  },

 
  methods: {
    delValue:function(){
      this.setData({
        value:''
      })
    },
    inputValue:function(e){
      e = e.detail.value
      console.log(e)
      this.setData({
        value: e
      })
    },
    search:function(){
      var a = this.properties.value
      this.triggerEvent('search',{a})
    }
  }
})
