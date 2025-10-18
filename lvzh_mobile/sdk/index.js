// sdk工具集成入口文件
import md5 from './md5.min.js'
const QQMapWX = require('./qqmap-wx-jssdk.js')
const qqmapsdk = new QQMapWX({
    key: 'CATBZ-K5KK3-DPY3Q-3YIBL-NI4KH-5VBN4'
    // key: 'QDEBZ-4NYE4-WURUV-DVZXV-5VTAO-Y7FAN'
});
import sha1 from './sha1.js'
import wxcharts from './wxcharts.js'

export default {
    md5,
    qqmapsdk,
    sha1,
    wxcharts
}