import {
	cloneDeep,
	isArray,
	isEmpty,
	isFunction,
	isObject,
	uniq,
} from 'lodash-es';

/**
 * @description: 校验是否是非空对象
 * @param {any} obj
 * @return {*}
 */
export function isNotEmptyObj(obj) {
	return isObject(obj) && !isEmpty(obj);
}

/**
 * @description: 校验是否是非空数组
 * @param {any} obj
 * @return {*}
 */
export function isNotEmptyArr(obj) {
	return isArray(obj) && !isEmpty(obj);
}

/**
 * @description: 获取设备类型，1表示isAndroid， , 2表示isIOS
 */
export function getDeviceType() {
	var u = navigator.userAgent,
		app = navigator.appVersion;
	var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //android终端或者uc浏览器
	var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
	if (isAndroid) {
		console.log('isAndroid');
		return 1;
	} else {
		console.log('isIOS');
		return 2;
	}
}

/**
 * @description: 轻提示
 * @param {string} title、提示文案内容
 * @param {string} icon、'none' | 'success' | 'loading' | 'error' | 'fail'
 * @param {number} duration、持续时间 ms
 */
export function showMsg(props) {
	let defaultProps = {
		icon: 'none',
		duration: 2000,
	}
	if (props) {
		if (typeof props === 'string') {
			defaultProps.title = props
		} else {
			defaultProps = Object.assign(defaultProps, props)
		}
	} else {
		defaultProps.title = '未知错误'
	}

	uni.showToast(defaultProps)
}

/**
 * @description: 加载loading
 * @param {string} title 提示文案内容
 */
export function showLoading(props) {
	let defaultProps = {
		title: '加载中...',
	}
	if (props) {
		if (typeof props === 'string') {
			defaultProps.title = props
		} else {
			defaultProps = Object.assign(defaultProps, props)
		}
	}
	uni.showLoading(defaultProps)
}

/**
 * @description: 隐藏loading
 */
export function hideLoading() {
	uni.hideLoading();
}


/**
 * @description: 隐藏轻提示
 */
export function hideToast() {
	uni.hideToast();
}

/**
 * @description: 消息模板提示
 * @param {string} content、提示文案内容
 * @param {string} title、提示标题
 * @param {string} confirmText 确认文案
 * @param {string} cancelText 取消文案
 */
export function showModal(props) {
	let defaultProps = {
		title: '提示',
		confirmText: '确定',
		cancelText: '取消'
	}

	if (props) {
		if (typeof props === 'string') {
			defaultProps.content = props
		} else {
			defaultProps = Object.assign(defaultProps, props)
		}
	}

	uni.showModal(defaultProps)
}

/**
 * @description: 获取用户信息
 */
export function getuserinfo() {
	return new Promise((resolve, reject) => {
		uni.getUserProfile({
			lang: 'zh_CN',
			desc: '为提供给用户更好的优质服务', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
			success: res => {
				// 电话号码弹窗
				uni.login({
					provider: 'weixin',
					success: function(loginRes) {
						console.log('login登录状态', loginRes.errMsg);
						if (loginRes.errMsg == 'login:ok') {
							console.log('获取到的code', loginRes.code)
							console.log('户个人信息', res.userInfo);
							let data = {
								code: loginRes.code,
								userInfo: res.userInfo
							}
							resolve(data)
						} else {
							showMsg('登录失败，请重新登录!');
						}
					}
				});
			},
			fail: () => {
				showMsg('登录失败，请重新登录!');
				reject(false)
			}
		});
	})
}

/**
 * @description: 如果用户取消授权，再次调用起授权; getSetting只有微信小程序支持， H5在微信环境下需要JSSDK鉴权实现
 */
export function getSetting() {
	return new Promise((resolve, reject) => {
		// #ifdef MP-WEIXIN
		wx.getSetting({
			success: (res) => {
				if (res.authSetting['scope.userLocation'] != undefined && res.authSetting[
						'scope.userLocation'] != true) { //非初始化进入该页面,且未授权
					wx.showModal({
						title: '是否授权当前位置',
						content: '需要获取您的地理位置，请确认授权，否则无法获取您所需数据',
						success: function(res) {
							if (res.cancel) {
								showMsg('授权失败')
								resolve(false)
							}
							if (res.confirm) {
								wx.openSetting({
									success: function(res) {
										if (res.authSetting[
												"scope.userLocation"] ==
											true) {
											showMsg('授权成功', 'success')
											resolve(true)
										} else {
											showMsg('授权失败')
											resolve(false)
										}
									}
								})
							}
						}
					})
				} else if (res.authSetting['scope.userLocation'] == undefined) { //初始化进入
					resolve(true)
				} else {
					//授权后默认加载
					resolve(true)
				}
			}
		})
		// #endif
		// #ifdef H5
		resolve(true)
		// #endif
	})
}

/**
 * @description: 地理定位
 */
export function getLocation() {
	return new Promise((resolve, reject) => {
		wx.getLocation({
			type: 'gcj02',
			isHighAccuracy: true,
			success: function(res) {
				console.log('res======>', res)
				resolve(res)
			},
			fail: function(err) {
				showMsg('定位失败，请检查网络,GPS定位是否开启以及微信地理位置授权等情况')
				reject(false)
			}
		});
	})
}

/**
 * @description: 微信小程序的选择附近的地址
 */
export function chooseLocation() {

	return new Promise((resolve, reject) => {
		uni.chooseLocation({
			success: function(res) {
				resolve(res)
			},
			fail: function(res) {
				showMsg('获取附近地址失败！请检查网络,GPS定位是否开启以及微信地理位置授权等情况！')
			}
		});

	})
}

/**
 * @description: 微信小程序的选择附近的地址
 * @param {{ longitude:number ,  latitude:number }} location 经纬度信息、
 */
export function openLocation(location) {
	return new Promise((resolve, reject) => {
		const {
			longitude,
			latitude
		} = location

		if (isNumber(longitude) && isNumber(latitude)) {
			const longitudeVal = convertNumber(longitude)
			const latitudeVal = convertNumber(latitude)

			uni.openLocation({
				longitude: longitudeVal,
				latitude: latitudeVal,
				success() {
					resolve(true)
				},
				fail() {
					showMsg('打开地图导航失败！')
				}
			})
		} else {
			showMsg('经纬度格式不正确，打开地图选取地址失败')
		}
	})
}

/**
 * @description: 监听网络发生变化
 */
export function isNetWork() {
	return new Promise((resolve, reject) => {
		uni.getNetworkType({
			success: function(res) {
				console.log(res.networkType == 'none');
				if (res.networkType != 'none') {
					resolve(true)
				} else {
					showMsg('当前无网络')
					resolve(false)
				}
			}
		});

	})
}

/**
 * 复制文本，H5复制
 * @param {string} txt 复制的文案
 */
export function copyTxt(txt) {
	txt += "";
	if (txt == "null" || txt == "undefined" || txt == "") {
		showMsg('复制失败，内容为空')
		return;
	}
	// #ifdef MP-WEIXIN
	uni.setClipboardData({
		data: txt,
		success: function() {
			showMsg('复制成功', 'success')
		}
	});
	// #endif
	// #ifdef H5
	if (document.queryCommandSupported('copy')) {
		let textarea = document.createElement("textarea")
		textarea.value = txt
		textarea.readOnly = "readOnly"
		document.body.appendChild(textarea)
		textarea.select() // 选中文本内容
		textarea.setSelectionRange(0, txt.length)
		let result = document.execCommand("copy")
		textarea.remove()
		showMsg('复制成功', 'success')
	} else {
		showMsg('您的浏览器不支持复制')
	}
	// #endif  
}

/**
 * 预览图片, 微信小程序只接受https链接图片，H5可接受本地图片
 * @param {string[]} imgArr 图片列表
 * @param {string[]} current 当前预览的位置
 */
export function previewImg(imgArr, current = 0) {
	return new Promise((resolve, reject) => {
		uni.previewImage({
			urls: imgArr,
			current: current,
			longPressActions: {
				itemList: ['发送给朋友', '保存图片', '收藏'],
				success: function(data) {
					resolve(true)
				},
				fail: function(err) {
					resolve(false)
				}
			}
		});
	})
}

/**
 * @description: 上传
 */
export function uploadFileFun(paths) {
	return new Promise((resolve, reject) => {
		const uploadTask = uni.uploadFile({
			url: upImgURL,
			filePath: paths,
			name: 'file',
			header: {
				'content-type': 'multipart/form-data',
			},
			formData: {
				imgType: '18', // 图片类型18 广告图片
				file: 'file', // 图片字段名
			},
			success: function(uploadFileRes) {
				console.log(uploadFileRes.data);
				let data = uploadFileRes.data ? JSON.parse(uploadFileRes.data) : {}
				console.log(data)
				if (data.code == 2) {
					resolve(data.data.image)
				} else {
					uni.showToast({
						title: data.msg,
						duration: 2000
					});
					reject(false)
				}
			},
			fail: function() {
				reject(false)
			}
		});
		uploadTask.onProgressUpdate(function(res) {
			console.log('上传进度' + res.progress);
			uni.showLoading({
				title: '上传进度' + res.progress
			});

			if (res.progress == 100) {
				uni.hideLoading();
			}

			console.log('已经上传的数据长度' + res.totalBytesSent);
			console.log('预期需要上传的数据总长度' + res.totalBytesExpectedToSend);
		});

	});
}

/**
 * @description: 上传图片
 */
export function chooseImage(options = {}) {
	return new Promise((resolve, reject) => {
		const defaultOptions = {
			count: 1,
			sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有，默认压缩
			sourceType: ['album'], //从相册选择
		}
		const mergeOptions = Object.assign(defaultOptions, options)
		uni.chooseImage({
			...mergeOptions,
			success: function(res) {
				resolve(res)
			},
			error: function(e) {
				reject(e)
			}
		});
	})
}

/**
 * @description: 上传视频
 * @param	maxDuration 	拍摄视频最长拍摄时间
 */
export function upload_video(options = {}) {
	return new Promise((resolve, reject) => {
		const defaultOptions = {
			maxDuration: 15, // 拍摄视频最长拍摄时间，单位秒。时间范围为 0s 至 15s 之间,不包括从相册中上传的,对IOS压缩有效，android无效
			count: 1,
			// camera: this.cameraList[this.cameraIndex].value,
			sourceType: ['album', 'camera'],
			//compressed : false, //禁止压缩，防止上传视频帧数不正常
		}
		const mergeOptions = Object.assign(defaultOptions, options)
		// 上传视频
		uni.chooseVideo({
			...mergeOptions,
			success: (res) => {
				resolve(res)
			},
			error: function(e) {
				resolve(false)
			}
		})
	})
}

/**
 * @description: 拨打电话
 * @param	phoneNum  电话
 */
export function makePhoneCall(phoneNum) {
	let phone = phoneNum ? phoneNum : DEFAULT_MAMANGE_PHONE_NUMBER
	uni.makePhoneCall({
		phoneNumber: phone
	})
}

/**
 * @description: 获取系统剪贴板内容
 */
export function getClipboardData() {
	return new Promise((success, fail) => {
		// #ifndef H5
		uni.getClipboardData({
			success: ({
				data
			}) => success(data),
			fail
		});
		// #endif

		// #ifdef H5
		try {
			navigator.clipboard
				.readText()
				.then(success)
				.catch(fail);
		} catch (error) {
			fail(error);
		}
		// #endif
	});
}

/**
 * @description: 获取rul参数
 */
export function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var params = window.location.search.substr(1).replace("__", "&");
	var r = params.match(reg);
	if (r != null) return unescape(r[2]);
	return null;
}


/**
 * @description: 获取范围内的随机数
 * @param {number}	min  最小值
 * @param {number}	max  最大值
 */
export function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @description: 解析身份证号
 * @param {string} idCard 身份证号
 * @return {*}
 */
export function parseIdCard(idCard) {
	if (idCard) {
		const idCardStr = String(idCard)
		if (idCardStr.length === 18) {
			const birthDate = idCard.substring(6, 10) + "-" + idCard.substring(10, 12) + "-" + idCard.substring(
				12, 14);
			const sexLabel = parseInt(idCard.substr(16, 1)) % 2 == 1 ? '男' : '女'
			const sex = getTypeCodeByLabel(sexLabel, this.sexList)
			return {
				birthDate,
				sex,
				sexText: sexLabel
			}
		} else {
			this.showMsg('身份证号长度不为18位')
			return false
		}
	} else {
		this.showMsg('请输入身份证号')
		return false
	}
}

/**
 * @description: 检测当前的小程序， 是否是最新版本，是否需要下载、更新
 * @return {*}
 */
export function checkUpdateVersion() {
	//判断微信版本是否 兼容小程序更新机制API的使用
	if (uni.canIUse('getUpdateManager')) {
		//创建 UpdateManager 实例
		const updateManager = uni.getUpdateManager(); //检测版本更新

		updateManager.onCheckForUpdate(function(res) {
			// 请求完新版本信息的回调
			if (res.hasUpdate) {
				//监听小程序有版本更新事件
				updateManager.onUpdateReady(function() {
					//TODO 新的版本已经下载好，调用 applyUpdate 应用新版本并重启 （ 此处进行了自动更新操作）
					updateManager.applyUpdate();
				});
				updateManager.onUpdateFailed(function() {
					// 新版本下载失败
					showModal({
						title: '已经有新版本喽~',
						content: '请您删除当前小程序，到微信 “发现-小程序” 页，重新搜索打开哦~'
					});
				});
			}
		});
	} else {
		//TODO 此时微信版本太低（一般而言版本都是支持的）
		showModal({
			title: '溫馨提示',
			content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
		});
	}
}

/**
 * @description: 校验对象属性值不能为空
 * @param { object } valdiateData 校验数据对象
 * @param { object } validateRules 校验规则对象
 * @param { string } text 校验提示文案
 */
export function validateObj(valdiateData, validateRules = {}, text = '') {
	if (isNotEmptyObj(validateRules)) {
		if (isNotEmptyObj(valdiateData)) {
			const errLog = []
			Object.keys(validateRules).forEach(ele => {
				const val = valdiateData[ele]
				if (!val) {
					errLog.push(`${text? text + '-' : ''}${validateRules[ele]}不能为空`)
				}
			})
			return errLog
		} else {
			return []
		}
	} else {
		return []
	}
}

/**
 * @description: 对象序列化，并排除空数据
 * @param { object } obj 对象
 * @param { string } 序列化的字符串
 */
export function qsStringify(obj) {
	if (isNotEmptyObj(obj)) {
		const isEmptyValArr = [undefined, null, '', 'null', 'undefined']
		return Object.entries(obj).filter(ele => {
			const [key, value] = ele
			return !isEmptyValArr.includes(value)
		}).map(ele => {
			const [key, value] = ele
			return `${key}=${value}`
		}).join('&')
	} else {
		return ''
	}
}