Component({
  options: {
    addGlobalClass: true,
    multipleSlots:true
  },
  properties: {
    type:{
      type:String,
      value:'input'
    },
    showRight:{
      type:String,
      value:'clear'
    },
    inputTitle:{
      type:String,
      value:'姓名'
    },
    placeholder:{
      type:String,
      value:''
    },
    // 输入的值
    value:{
      type:String | Number ,
      value:''
    }
  },
  // data: {
  //   value:'',
  // },
  methods: {
    inputVal(ele){
      var value = ele.detail.value
      console.log(value)
      this.triggerEvent('inputVal' , value)

    },
    clickImg(){
      this.setData({
        value : ''
      })
    }
  }
})