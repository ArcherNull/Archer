const app = getApp()
Component({
    /**
     * eventhandle
     * handleToBottom => 滚动到底部
     * handleToTop => 下拉刷新
     */
    properties: {
        // 盒子高度，请带单位
        boxHeight: {
            type: String,
            value: "1000rpx",
        },
        // 盒子宽度，请带单位
        boxWidth: {
            type: String,
            value: "100%"
        },
        // 下拉的状态
        isTopUpdate: {
            type: Boolean,
            value: false
        },
        // 到底提示(无数据提示)
        isEnd: {
            type: Boolean,
            value: true
        }
    },
    options: {
        multipleSlots: true
    },
    data: {
        topTip: '松开立即刷新',
        showBtmTips: true
    },
    methods: {
        // <自定义下拉>被下拉 => 连续的
        handleRefresherpulling: function (ev) {
            console.log('<自定义下拉>被下拉 => 连续的')
            this.setData({
                topTip: '松开立即刷新'
            })
        },
        // <自定义下拉>被下拉 => 松开触发
        handleRefresherrefresh(ev) {
            console.log('自定义下拉>被下拉 => 松开触发')
            this.triggerEvent('handleToTop', ev)
            this.setData({
                topTip: '正在刷新...'
            })
        },
        // 自定义下拉刷新被复位
        bindrefresherrestore() {
            console.log('自定义下拉刷新被复位')
            this.setData({
                showBtmTips: false
            })
        },
        // 滚动到底部
        handleToBottom: app.commModule.common.throttle(function (ev) {
            console.log('滚动到底部')
            this.triggerEvent('handleToBottom', ev)
        }, 250)
    }
})