// components/pop/pop.js
Component({
  properties: {
    //pop类型
    type:{
      type:String,
    },
    //是否展示search搜索框
    search:{
      type:Boolean,
      value:true,
    }
  },

  data: {

  },
  methods: {
    //关闭弹窗
    closePop(){
      this.triggerEvent('closePop')
    },
    //取消
    clear(){
      this.triggerEvent('clear')
    },
    //确定
    submit(){
      this.triggerEvent('submit')
    }
  }
})
