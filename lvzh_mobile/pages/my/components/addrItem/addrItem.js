Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    addrList:{
      type :Array,
      value:[]
    }
  },
  methods: {
    clickTag(ele){
      let item = ele.currentTarget.dataset.item
      this.triggerEvent('clickTagFun' , item)
    }
  }
})