const app = getApp()
const filter = app.commModule.filter //路由守卫

Page(filter({
    data: {
        //操作栏
        btnList: [ {
            src: '../../static/my_acount.png',
            title: '证件识别',
            alertInfo: 0,
        }]
    },
    // 点击操作项事件
    clickItemFun(ele) {
        const item = ele.detail
        console.log('点击操作项事件', item)
        let url = ''
        switch (item.title) {
            case '证件识别':
                console.log('证件识别')
                url = './cardIdentify/cardIdentify'
                break;
        }
        wx.navigateTo({
            url
        })
    }
}))