Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    tags: {
      type: Array,
    },
    type:{
      type:String,
      value:'login'
    },
    tagIndex:{
      type:Number,
      value:0
    }
  },

  data: {

  },

  methods: {
    clickTag:function(e){
      e = e.currentTarget.dataset.index
      this.triggerEvent('clickTag',{e})
    }
  }
})