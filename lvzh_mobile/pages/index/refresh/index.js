// pages/index/refresh/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isTopUpdate: true,
        isEnd: false
    },
    // 刷新完毕
    handleToTop(ele) {
        console.log('刷新完毕', ele)
        setTimeout(() => {
            this.setData({
                isTopUpdate: false,
                isEnd: false
            })
        }, 2500);
    },
    // 滚动到底部
    handleToBottom(ele) {
        this.setData({
            isEnd: true
        })

        setTimeout(() => {
            this.setData({
                isEnd: false
            })
        }, 2500);
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})