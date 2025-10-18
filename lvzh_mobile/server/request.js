const app = getApp()
let baseUrl = 'https://sdzk-sz.com/v4/admin/' // 正式域名
let testUrl = 'https://test1.sdzk-sz.com/v4/admin/' // 测试域名
let isTestEnv = false // 是否是测试环境 ， false不是，true是
let testToken = null // 测试token
let token = isTestEnv ? testToken : wx.getStorageSync('token')

let noTokenApis = ['login'] // 不需要token校验的接口apis


//  请求配置
let REQUEST_CONFIG = {
    env: 'dev',
    // 非token校验接口
    noTokenApis: ['login'],
    // 请求超时时长
    timeout: 6000,
    // 默认头部
    defaultHeader: {
        'content-type': 'application/json', // 默认值
        // 'content-type': 'multipart/form-data',
        // 'content-type': 'application/x-www-form-urlencoded', // 默认值
    },
    // 环境配置列表
    envList: {
        // 测试
        dev: {
            // 域名
            baseUrl: '',
            // 测试token
            testToken: '',
        },
        // 预发版
        uat: {
            // 域名
            baseUrl: '',
            // 测试token
            testToken: '',
        },
        // 正式
        pro: {
            // 域名
            baseUrl: '',
            // 测试token
            testToken: '',
        },
    }
}

// 请求方法
export const request = (api, data, method = "GET") => {
    let url = isTestEnv ? testUrl : baseUrl
    // 头部信息
    let header = {
        'content-type': 'application/json', // 默认值
        'token': token
    }
    let timeout = '6000' // 请求超时时长
    return new Promise((resolve, reject) => {
        if (noTokenApis.includes(api)) {
            if (!token) {
                wx.navigateTo({
                    url: '/pages/login/wxLogin/wxLogin',
                })
            } else {
                const requestTask = wx.request({
                    url: url + api,
                    method,
                    data,
                    header,
                    timeout,
                    success(res) {
                        resolve('请求得到的数据', res)
                    },
                    fail(res) {
                        app.commModule.common.showMsg(res.msg || '服务器返回错误，请稍后重试！')
                        reject(res)
                    }
                })
                requestTask.onHeadersReceived(function (res) {
                    console.log('onHeadersReceived', res)
                })
            }
        }
    })
}

// 文件上传
function upLoadFile(url, upUrl) {
    return new Promise(function (resolve, reject) {
        //，选择成功，视频上传
        wx.uploadFile({
            url: baseURL + url, //开发者服务器的 url
            filePath: upUrl, // 要上传文件资源的路径 String类型！！！
            name: "file", // 文件对应的 key ,(后台接口规定的关于图片的请求参数)
            header: {
                'content-type': 'multipart/form-data'
            }, // 设置请求的 header
            formData: {}, // HTTP 请求中其他额外的参数
            success: function (res) {
                //上传成功后隐藏加载框
                //console.log(res)
                resolve(res.data);
            },
            fail: function (res) {
                //请求失败
                reject(res)
                app.commModule.common.showMsg("图片上传失败:" + res)
                //console.log("图片上传失败" + res);
            }
        })
    })
}

// 序列化参数
const convertObj = (data) => {
    let str = '?'
    let arr = Object.entries(data)
    let spec = ''
    arr.forEach((ele, ind, array) => {
        spec = (ind !== array.length - 1) ? '&' : ''
        str += ele.join('=') + spec
    })
    return str
}

// 序列化参数
export function paramsSerializing(obj) {
    const emptyArr = [undefined, 'undefined', 'null', '', null]
    return Object.entries(obj).filter(ele => !emptyArr.includes(ele[1])).map(ele => `${ele[0]}=${ele[1]}`).join('&')
}

// 文件上传
export function upLoadFileAjax(upUrl) {
    return new Promise(function (resolve, reject) {
        wx.showLoading({
            title: "上传中...",
        });
        //，选择成功，视频上传
        wx.uploadFile({
            url: origin + "/upload/file/upload", //开发者服务器的 url
            filePath: upUrl, // 要上传文件资源的路径 String类型！！！
            name: "file", // 文件对应的 key ,(后台接口规定的关于图片的请求参数)
            header: {
                "content-type": "multipart/form-data",
                ...getHeadrInfo(),
            }, // 设置请求的 header
            formData: {}, // HTTP 请求中其他额外的参数
            success: function (res) {
                console.log("res", res);
                if (res.statusCode === 200) {
                    //数据获取成功
                    const resData = JSON.parse(res.data);
                    console.log("resData====。", resData);
                    if (resData.code === 200) {
                        //上传成功后隐藏加载框
                        resolve(resData.data);
                    } else {
                        const errMsg = resData.msg || "上传失败";
                        wx.showToast({
                            title: errMsg,
                            icon: "error",
                        });
                        reject(errMsg);
                    }
                } else {
                    reject(res.msg || "上传失败");
                }
            },
            fail: function (res) {
                //请求失败
                wx.showToast({
                    title: res || "图片上传失败",
                    icon: "error",
                });
                reject(res);
            },
            complete: function () {
                wx.hideLoading();
            },
        });
    });
}