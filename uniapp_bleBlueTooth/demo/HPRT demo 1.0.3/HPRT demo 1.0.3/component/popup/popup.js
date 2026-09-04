// component/popup.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        showModal: {
            type: Boolean,
            value: false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        width:200,
        height:200
    },

    /**
     * 组件的方法列表
     */
    methods: {
       onCancel () {
            //触发取消回调
            this.triggerEvent("cancel")
            this.setData({
                width:200,
                height:200
            })
        },
        onConfirm () {
            //触发成功回调
            if (!this.data.width  ) {
                return wx.showToast({
                  title: '请输入宽度',
                  icon:'none'
                })
            }
            // if (this.data.width <= 0 || this.data.width > 575) {
            //     return wx.showToast({
            //       title: '请输入小于575大于0的宽度',
            //       icon:'none'
            //     })
            // }
            // if (!this.data.height ) {
            //     return wx.showToast({
            //         title: '请输入高度',
            //         icon:'none'
            //     })
            // }
            // if (this.data.height <= 0 || this.data.height > 575) {
            //     return wx.showToast({
            //         title: '请输入小于575大于0的高度',
            //         icon:'none'
            //     })
            // }
            this.triggerEvent("confirm",{width:this.data.width});
            // this.setData({
            //     width:200,
            //     height:200
            // })
        },
        inputValueWidth (e) {
            // console.log(e)
            this.setData({
                width:e.detail.value
            })
        },
        // inputValueHeight (e) {
        //     this.setData({
        //         height:e.detail.value
        //     })
        // }
    }
})
