Component({
    options:{
        addGlobalClass:true
    },
    properties: {
        btnList:{
            type:Array,
            value:[]
        }
    },
    methods: {
        clickOperation(ele){
            const item = ele.currentTarget.dataset.item
            this.triggerEvent('clickItem' , item)
        }
    }
})
