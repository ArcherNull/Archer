const app = getApp()
Component({
  options:{
    addGlobalClass: true,
  },
  properties: {
    //pop类型
    indexSwiper:{
      type:Array,
      value:[]
    },
    // 语言类型 ,zh中文， en英文 
    languageType:{
      type:String,
      value:'zh'
    }
  },

  methods:{
    clickSwiper(ele){
      var item = ele.currentTarget.dataset.item
      app.commModule.common.showModal(item[this.properties.languageType],'消息')
    }
  },
})