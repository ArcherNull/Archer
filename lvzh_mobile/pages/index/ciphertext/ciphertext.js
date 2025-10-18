Page({
    data: {
        //操作栏
        btnList: [{
            src: '../../static/my_acount.png',
            title: 'md5',
            alertInfo: 0,
        }, {
            src: '../../static/my_acount.png',
            title: 'sha1',
            alertInfo: 0,
        }, {
            src: '../../static/my_acount.png',
            title: '微信UserCryptoManager加密对象',
            alertInfo: 0,
        }]
    },
    // 点击操作项事件
    clickItemFun(ele) {
        const item = ele.detail
        let url = ''
        switch (item.title) {
            case 'md5':
                console.log('md5')
                url = './md5/md5'
                break;
            case 'sha1':
                console.log('sha1')
                url = './sha1/sha1'
                break;
            case '微信UserCryptoManager加密对象':
                console.log('微信UserCryptoManager加密对象')
                url = './wxApi/wxApi'
                break;
        }
        wx.navigateTo({
            url
        })
    }
})