/* 首页的时间选择器 */
Component({
  options:{
    addGlobalClass:true
  },
  data:{
    clickIndex:0 // 选中的选项
  },
  properties:{
    showDom:{
      type:Boolean,
      value:false
    },
    tagsList:{
      type:Array,
      value:[]
    }
  },
  methods:{
    clickTag(ele){
      let item = ele.currentTarget.dataset.item
      let index = ele.currentTarget.dataset.index
      this.setData({
        clickIndex : index
      })
      console.log(item)
      this.triggerEvent('clickDataTag',item)
    },
    closeIndexDate(){
      /* this.properties.showDom = !this.properties.showDom */
    }
  }
})