Page({
    data: {
        //操作栏
        btnList: [{
            src: '../../static/my_acount.png',
            title: '微信小程序自带定位',
            alertInfo: 0,
        }, {
            src: '../../static/my_acount.png',
            title: '腾讯位置服务JSSDK定位',
            alertInfo: 0,
        }, {
            src: '../../static/my_acount.png',
            title: '地图应用实例1--chooseLocation',
            alertInfo: 0,
        }]
    },
    // 点击操作项事件
    clickItemFun(ele) {
        console.log('ele=====>', ele)
        const item = ele.detail
        switch (item.title) {
            case '微信小程序自带定位':
                console.log('微信小程序自带定位')
                wx.navigateTo({
                    url: './currentLocation/currentLocation'
                })
                break;
            case '腾讯位置服务JSSDK定位':
                console.log('腾讯位置服务JSSDK定位')
                wx.navigateTo({
                    url: './LocationPerimeter/LocationPerimeter'
                })
                break;
            case '地图应用实例1--chooseLocation':
                wx.chooseLocation({
                    latitude: 34.752465,
                    longitude: 113.6653,
                    success: function (res) {
                        console.log('位置名称：' + res.name);
                        console.log('详细地址：' + res.address);
                        console.log('纬度：' + res.latitude);
                        console.log('经度：' + res.longitude);
                    }
                });
                break;
        }

    }
})