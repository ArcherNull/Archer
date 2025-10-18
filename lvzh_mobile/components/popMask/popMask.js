
Component({
  options:{
    addGlobalClass:true
  },
  properties: {
    // 蒙层的展示和隐藏
    showPopMask:{
      type:Boolean,
      value:false
    },
    
  },
  data: {
    
  },

  methods: {
    close(){
      this.triggerEvent('closePop')
    }
  }
})
