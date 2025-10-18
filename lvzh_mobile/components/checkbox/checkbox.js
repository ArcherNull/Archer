// components/checkbox/checkbox.js
Component({
  options:{
    addGlobalClass:true
  },
  properties: {
    checkBool:{
      type:Boolean,
      value:false
    },
    type:{
      type:String,
      value:'rect'
    }
  },

  data: {

  },

  methods: {
    click:function(){
      var a = !this.properties.checkBool
      this.setData({
        checkBool : !this.properties.checkBool
      })
      this.triggerEvent('clickCheck',{a})
    }
  }
})
