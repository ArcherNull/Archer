// 百度AK
export const BAIDU_AK = 'YMrC0KTdWJmLZCQM5CzW5V1DPOfVvBDV'
// 百度客户端id
export const BAIDU_CLIENT_ID = '百度客户端id'
// 百度客户端密钥
export const BAIDU_CLIENT_SECRET = '百度客户端密钥'

// 空字符特征
const EMPTY_STR_ARR = [undefined, '', null]

// 格式化
function formatDateStr(n) {
	return n > 9 ? n : '0' + n
}

/**
 * @description: 获取当前日期 , 负数表示以前,正数标示未来
 * @param {number} offset 偏移量
 * @return {*}
 */
export function getCurrentDate(offset = 0, type = 1) {
	const dayTimeStr = offset * (60 * 1000 * 60 * 24)
	const dateTimeStr = new Date().getTime() + dayTimeStr
	const date = new Date(dateTimeStr)
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	let day = date.getDate();
	let hour = date.getHours();
	let minute = date.getMinutes();
	let second = date.getSeconds();
	let dataStr = `${year}-${formatDateStr(month)}-${formatDateStr(day)}`
	if (type === 1) {
		dataStr += ` ${formatDateStr(hour)}:${formatDateStr(minute)}:${formatDateStr(second)}`
	}
	return dataStr
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


// 信息提示
export function showMsg(text, icon = 'none', duration = 2500) {
	uni.showToast({
		title: text,
		icon: icon,
		duration
	})
}

// 信息提示
export function showNextMsg(text, icon = 'none', duration = 2500) {
	setTimeout(() => {
		uni.showToast({
			title: text,
			icon: icon,
			duration
		})
	})
}

/**
 * @description: 如果用户取消授权，再次调用起授权; getSetting只有微信小程序支持， H5在微信环境下需要JSSDK鉴权实现
 */
export function getSetting() {
	return new Promise((resolve, reject) => {
		// #ifndef H5 || APP
		wx.getSetting({
			success: (res) => {
				if (res.authSetting['scope.userLocation'] != undefined && res.authSetting[
						'scope.userLocation'] != true) { //非初始化进入该页面,且未授权
					wx.showModal({
						title: '是否授权当前位置',
						content: '需要获取您的地理位置，请确认授权，否则无法获取您所需数据',
						success: function(res) {
							if (res.cancel) {
								reject('取消授权，地理定位失败')
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
											reject('授权失败，地理定位失败')
										}
									}
								})
							}
						},
						fail() {
							reject('地理定位失败')
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
		const systemInfo = uni.getSystemInfoSync()
		const system = systemInfo.system
		if (system) {
			console.log('system=====>', system)
			if (navigator?.geolocation?.getCurrentPosition) {
				function onSuccess(position) {
					console.log('position', position)
					resolve(true)
				}
				//定位数据获取失败响应  
				function onError(error) {
					console.log('error', error)
					let errorStr = '定位失败'
					switch (error.code) {
						case error.PERMISSION_DENIED:
							errorStr = "您拒绝对获取地理位置的请求"
							break;
						case error.POSITION_UNAVAILABLE:
							errorStr = "您拒绝对获取地理位置的请求"
							break;
						case error.TIMEOUT:
							errorStr = "请求您的地理位置超时"
							break;
						case error.UNKNOWN_ERROR:
							errorStr = "定位失败"
							break;
					}
					showMsg(errorStr)
					setTimeout(() => {
						reject(errorStr)
					}, 1000)
				}

				navigator.geolocation.getCurrentPosition(onSuccess, onError, {
					// 高精度
					enableHighAccuracy: true,
					// 超时时间60s
					timeout: 100 * 1000
				});
			} else {
				reject("您的浏览器不支持使用HTML5来获取地理位置服务");
				// resolve(true)
			}
		} else {
			reject('未获取到设备信息')
		}
		// #endif
	})
}

/**
 * @description: 地理定位， H5如果是微信公众号，最好是使用微信的jssdk,定位更精确
 */
export function getLocation() {
	return new Promise((resolve, reject) => {
		uni.getLocation({
			// #ifdef MP-WEIXIN
			type: 'gcj02',
			isHighAccuracy: true,
			// #endif
			// #ifdef H5
			type: "wgs84",
			geocode: true,
			// #endif
			success: function(res) {
				if (res?.errMsg === 'getLocation:ok') {
					resolve(res)
				} else {
					reject('定位失败，请重试')
				}
			},
			fail: function(err) {
				reject('定位失败，请检查网络,GPS定位是否开启以及微信地理位置授权等情况')
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

// 处理及校验传参
function dealWatermarkConfig(options) {
	const valdiateRulesObj = {
		canvasId: '画布id',
		imagePath: '本地图片路径',
	}

	const defaultWatermarkItem = {
		fontSize: 20,
		color: 'red',
		margin: 25,
		position: 'bottomLeft', // topLeft / topRight / bottomLeft / bottomRight
	}

	const errLog = validateObj(options, valdiateRulesObj)
	const {
		canvasId,
		watermarkList,
		...restObj
	} = options

	let nList = []
	if (isNotEmptyArr(watermarkList)) {
		const nErrLog = []
		watermarkList.forEach(ele => {
			const nEle = {
				...defaultWatermarkItem,
				...ele,
			}

			if (convertNumber(nEle.fontSize) <= 16) {
				nErrLog.push('水印项字体大小需大于16')
			}

			if (convertNumber(nEle.margin) <= 10) {
				nErrLog.push('水印项边距大小需大于10')
			}

			if (typeof nEle.text === 'string') {
				EMPTY_STR_ARR.includes(nEle.text) && nErrLog.push('水印项文案不能为空')
			} else {
				!isNotEmptyArr(nEle.text) && nErrLog.push('水印项文案数组不能为空')
			}

			const positionArr = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
			if (!positionArr.includes(nEle.position)) {
				nErrLog.push(`水印项位置不满足【${positionArr.join('/')}】其中之一`)
			}

			if (!nErrLog.length) {
				nList.push(nEle)
			}
		})
		errLog.push(...nErrLog)
	} else {
		errLog.push('水印项是必填的且为数组')
	}

	return {
		errLog,
		config: {
			...restObj,
			canvasId,
			watermarkList: nList
		}
	}
}

// 计算x,y位置
function calcPosition(options) {
	const {
		height,
		width,
		position,
		margin: marginVal,
		ind,
		fontSize,
		textMetrics
	} = options
	let calcX = marginVal
	let calcY = height - marginVal
	switch (position) {
		case 'topLeft': {
			calcX = marginVal
			calcY = marginVal + (fontSize * (ind + 1))
			break;
		}
		case 'topRight': {
			calcX = width - marginVal - textMetrics.width
			calcY = marginVal + (fontSize * (ind + 1))
			break;
		}

		case 'bottomLeft': {
			calcX = marginVal
			calcY = height - marginVal - (fontSize * ind)
			break;
		}

		case 'bottomRight': {
			calcX = width - marginVal - textMetrics.width
			calcY = height - marginVal - (fontSize * ind)
			break;
		}
	}

	return {
		calcX,
		calcY
	}
}

/**
 * @description: 给图片添加水印
 * @param {string} options
 * @param {string} that 组件的this实例
 * @return {*}
 * ···
 * // 在template 中加入：
 * 			<canvas :style="{ width: watermarkCanvasOption.width + 'px', height: watermarkCanvasOption.height + 'px' }"
 *				canvas-id="watermarkCanvas" id="watermarkCanvas" style="position: absolute; top: -10000000rpx;" />
 * 
 * // 在 script 的 data中加入
 *   			watermarkCanvasOption: {
 *					width: 0,
 *					height: 0,
 *					canvasContext: void(0)
 *				}
 * 
 * // 在对应地方使用
 * addWatermark({
					canvasId: 'watermarkCanvas',
					imagePath: tPath,
					watermarkList: [{
						fontSize: 12,
						text: '测试',
						// text: ['测试', '测试12'],
					}]
				}, this).then(res => {
					return saveImageToPA(res)
				})
 * ···
 */
export function addWatermark(options, that) {
	return new Promise((resolve, reject) => {
		const {
			errLog,
			config
		} = dealWatermarkConfig(options)
		if (!errLog.length) {
			const {
				canvasId,
				imagePath,
				watermarkList
			} = config

			that.watermarkCanvasOption.width = 0
			that.watermarkCanvasOption.height = 0

			uni.getImageInfo({ // 获取图片信息，以便获取图片的真实宽高信息
				src: imagePath,
				success: (info) => {
					console.log('info123123123', info)
					const {
						width,
						height,
						type,
					} = info; // 获取图片的原始宽高
					const fileTypeObj = {
						'jpeg': 'jpg',
						'jpg': 'jpg',
						'png': 'png',
					}
					const fileType = fileTypeObj[type] || 'png'

					that.watermarkCanvasOption.width = width
					that.watermarkCanvasOption.height = height

					that.$nextTick(() => {
						const ctx = uni.createCanvasContext(canvasId,
							that); // 获取canvas绘图上下文

						console.log('ctx', ctx)

						ctx.drawImage(imagePath, 0, 0, width, height); // 绘制原始图片到canvas上\
						// 绘制水印项
						const drawWMItem = (ctx, options) => {

							const {
								fontSize,
								color,
								text: cText,
								position,
								margin
							} = options
							// 添加水印
							ctx.setFontSize(fontSize); // 设置字体大小
							ctx.setFillStyle(color); // 设置字体颜色为红色

							if (isNotEmptyArr(cText)) {
								const text = cText.filter(Boolean)
								if (position.startsWith('bottom')) {
									text.reverse()
								}
								text.forEach((str, ind) => {
									const textMetrics = ctx.measureText(str);
									const {
										calcX,
										calcY
									} = calcPosition({
										height,
										width,
										position,
										margin,
										ind,
										fontSize,
										textMetrics
									})
									ctx.fillText(str, calcX, calcY, width);
								})
							} else {
								const textMetrics = ctx.measureText(cText);

								const {
									calcX,
									calcY
								} = calcPosition({
									height,
									width,
									position,
									margin,
									ind: 0,
									fontSize,
									textMetrics
								})
								// 在图片底部添加水印文字
								ctx.fillText(cText, calcX, calcY, width);
							}
						}

						watermarkList.forEach(ele => {
							drawWMItem(ctx, ele)
						})

						// 绘制完成后执行的操作，这里不等待绘制完成就继续执行后续操作，因为我们要导出为图片
						ctx.draw(false, () => {
							// #ifndef MP-ALIPAY
							uni.canvasToTempFilePath({ // 将画布内容导出为图片
								canvasId,
								x: 0,
								y: 0,
								width: width,
								height: height,
								destWidth: width,
								destHeight: height,
								fileType,
								success: (res) => {
									console.log('res.tempFilePath', res)
									resolve(res.tempFilePath)
								},
								fail() {
									reject(false)
								}
							}, that);
							// #endif

							// #ifdef MP-ALIPAY
							ctx.toTempFilePath({ // 将画布内容导出为图片
								canvasId,
								x: 0,
								y: 0,
								width: width,
								height: height,
								destWidth: width,
								destHeight: height,
								fileType,
								success: (res) => {
									console.log('res.tempFilePath', res)
									resolve(res.tempFilePath)
								},
								fail() {
									reject(false)
								}
							}, that);
							// #endif 
						});
					})
				}
			});
		} else {
			const errStr = errLog.join(';')
			showMsg(errStr)
			reject(errStr)
		}
	})
}

// 保存图片到相册
export function saveImageToPA(tPath) {
	return new Promise((resolve, reject) => {
		// #ifndef H5
		if (tPath) {
			uni.saveImageToPhotosAlbum({
				filePath: tPath,
				success: function() {
					showMsg('保存成功')
					resolve(true)
				},
				fail() {
					reject(false)
				}
			});
		} else {
			showMsg('未获取到图片本地路径')
			reject(false)
		}
		// #endif
		// #ifdef H5
		showMsg('H5不支持saveImageToPhotosAlbum方法')
		reject(true)
		// #endif
	})
}

// 获取url params 字符串
export function getUrlParamsStr(paramsObj) {
	if (typeof paramsObj === 'object') {
		return Object.entries(paramsObj).map(ele => `${ele[0]}=${ele[1]}`).join('&')
	} else {
		return ''
	}
}

/**
 * @description: 转换为数字
 * @param {unknown} str
 * @return {*}
 */
export function convertNumber(str) {
	const val = Number(str)
	return isNaN(val) ? 0 : val
}


// 判断是否是空对象
export function isNotEmptyObj(obj) {
	return typeof obj === 'object' && Object.keys(obj)?.length
}

// 判断是否是空数组
export function isNotEmptyArr(arr) {
	return Array.isArray(arr) && arr.length
}

// 校验对象属性值不能为空
function validateObj(valdiateData, validateRules = {}, text = '') {
	if (isNotEmptyObj(validateRules)) {
		if (isNotEmptyObj(valdiateData)) {
			const errLog = []
			Object.entries(validateRules).forEach(item => {
				const [key, value] = item
				const val = valdiateData[key]
				if (typeof value === 'string') {
					if (EMPTY_STR_ARR.includes(val)) {
						errLog.push(`${text? text + '-' : ''}${validateRules[key]}不能为空`)
					}
				} else if (isNotEmptyObj(value)) {
					const {
						name,
						rules
					} = value
					if (isNotEmptyArr(rules) && !rules.includes(val)) {
						errLog.push(`${text? text + '-' : ''}${name}不能满足【${rules.join('/')}】其中之一`)
					}
				} else if (typeof value === 'function') {
					const fRes = value(val)
					fRes && errLog.push(fRes?.toString())
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

// 获取百度accessToken
export function getBaiduAPIAccessToken() {
	let that = this
	return new Promise((resolve, reject) => {
		const paramsObj = {
			client_id: BAIDU_CLIENT_ID,
			client_secret: BAIDU_CLIENT_SECRET,
			grant_type: 'client_credentials'
		}
		const paramsStr = getUrlParamsStr(paramsObj)
		uni.request({
			url: 'https://aip.baidubce.com/oauth/2.0/token?' + paramsStr,
			method: "POST",
			dataType: "json",
			header: {
				'Content-Type': 'application/json'
			},
			success: function(res) {
				console.log('获取百度accessToken======>', res)
				const token = res?.data?.access_token || ''
				if (token) {
					resolve(token)
				} else {
					reject(false)
				}
			},
			fail: function(res) {
				reject(false)
			}
		});
	})
}

/**
 * @description: 通过百度AI 开放接口解析地址
 * @param { { access_token:string , addressStr:string } } config  access_token 百度token , addressStr 地址文案
 */
export function parseAddressByBaiduAPI(config) {
	return new Promise((resolve, reject) => {
		const {
			access_token,
			addressStr
		} = config
		if (access_token) {
			if (addressStr) {
				uni.request({
					url: 'https://aip.baidubce.com/rpc/2.0/nlp/v1/address?access_token=' + access_token,
					method: "POST",
					dataType: "json",
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						"text": addressStr,
						"confidence": 100
					},
					success: (res) => {
						console.log('通过百度AI 开放接口解析地址=====>', res)
						resolve(res)
					},
					fail: (res) => {
						reject(false)
					}
				});
			} else {
				reject('解析地址字符串不能为空')
			}
		} else {
			reject('缺少百度accessToken,无法调用此API')
		}
	})
}

/**
 * @description: 通过关键词获取百度地址
 * @param { { provice:string , city:string, area:string, address:string } } config 关键词
 */
export function getBaiduAddressListByKeywords(config) {
	return new Promise((resolve, reject) => {
		if (config && typeof config === 'object') {
			const valdiateRulesObj = {
				province: '省份',
				city: '城市',
			}

			const errLog = validateObj(config, valdiateRulesObj)

			if (!errLog.length) {

				const {
					province,
					city,
					area,
					address
				} = config

				const region = province + city + area
				const paramsObj = {
					ak: BAIDU_AK,
					query: region + address,
					region,
					output: 'json'
				}

				const paramsStr = getUrlParamsStr(paramsObj)

				uni.request({
					// #ifdef MP-WEIXIN
					url: 'https://api.map.baidu.com/place/v2/search?' + paramsStr,
					// #endif
					// #ifdef H5
					url: '/place/v2/search?' + paramsStr,
					// #endif
					method: "get",
					dataType: "json",
					header: {
						'Content-Type': 'application/json'
					},
					success: (res) => {
						const addressList = res?.data?.results || []
						resolve(addressList)
					},
					fail: (res) => {
						reject('搜索详细地址列表失败')
					}
				});
			} else {
				showMsg(errLog[0])
				reject(errLog[0])
			}
		} else {
			showMsg('参数[config]为非空对象')
			reject('参数[config]为非空对象')
		}
	})
}

/**
 * @description: 通过经纬度解析百度地址
 * @param { { location:string | number, latitude:string | number  } } config 经纬度对象
 * 
 * 示例请求： https://api.map.baidu.com/reverse_geocoding/v3/?ak=您的ak&output=json&coordtype=wgs84ll&location=31.225696563611,121.49884033194
 * 官方文档： https://lbsyun.baidu.com/faq/api?title=webapi/guide/webservice-geocoding-abroad-base
 */
export function getBaiduAddressInfoByLocation(config) {
	return new Promise((resolve, reject) => {
		if (config && typeof config === 'object') {

			const {
				longitude,
				latitude
			} = config

			const longitudeVal = convertNumber(longitude)
			const latitudeVal = convertNumber(latitude)

			const errLog = []
			if (longitudeVal >= 180 && longitudeVal <= 90) {
				errLog.push('经度[longitude]参数需大90度并小于180度')
			}

			if (latitudeVal >= 90 && latitudeVal <= 0) {
				errLog.push('经度[longitude]参数需大0度并小于90度')
			}

			if (!errLog.length) {
				const paramsObj = {
					ak: BAIDU_AK,
					location: `${latitudeVal},${longitudeVal}`,
					output: 'json'
				}

				const paramsStr = getUrlParamsStr(paramsObj)

				uni.request({
					// #ifdef MP-WEIXIN
					url: 'https://api.map.baidu.com/reverse_geocoding/v3/?' + paramsStr,
					// #endif
					// #ifdef H5
					url: '/reverse_geocoding/v3/?' + paramsStr,
					// #endif
					method: "get",
					dataType: "json",
					header: {
						'Content-Type': 'application/json'
					},
					success: (res) => {
						const addressInfo = res?.data?.result
						console.log('经纬度解析百度地址', addressInfo)
						if (addressInfo) {
							resolve(addressInfo)
						} else {
							reject('经纬度解析地址失败')
						}
					},
					fail: (res) => {
						reject('经纬度解析地址失败')
					}
				});

			} else {
				reject(errLog[0])
			}
		} else {
			reject('参数[config]为非空对象')
		}
	})
}

// 校验参数
function dealCompressImgConfig(options) {
	const valdiateRulesObj = {
		canvasId: '画布id',
		imagePath: '本地图片路径',
	}
	const errLog = validateObj(options, valdiateRulesObj)

	return {
		errLog,
		config: options
	}
}

/**
 * @description: 获取文件信息
 * @param { { imagePath :  string  } } config 本地图片路径
 * 
 *  ios 微信小程序支持 wx.compressImage(Object object) 压缩图片接口，可选压缩质量。iOS 仅支持压缩 JPG 格式图片
 */
export function getFileInfoFun(options) {
	return new Promise((resolve, reject) => {
		const {
			imagePath
		} = options
		if (imagePath) {
			// #ifndef H5
			const fileManager = uni.getFileSystemManager()
			fileManager.getFileInfo({
				filePath: imagePath,
				success: (res) => resolve(res),
				fail: () => reject(false)
			})
			// #endif

			// #ifdef H5
			reject('H5不支持getFileSystemManager方法')
			// #endif

		} else {
			reject(false)
		}
	})
}

// 压缩图片
export function compressImg(options, that) {
	console.log('压缩图片=====>')
	return new Promise((resolve, reject) => {
		const {
			errLog,
			config
		} = dealCompressImgConfig(options)
		if (!errLog.length) {
			const {
				canvasId,
				imagePath,
				// 文件尺寸
				quality = 0.6
			} = config

			that.watermarkCanvasOption.width = 0
			that.watermarkCanvasOption.height = 0

			// 获取图片信息，以便获取图片的真实宽高信息
			uni.getImageInfo({
				src: imagePath,
				success: (info) => {
					const {
						width: oWidth,
						height: oHeight,
						type,
						orientation
					} = info; // 获取图片的原始宽高
					const fileTypeObj = {
						'jpeg': 'jpg',
						'jpg': 'jpg',
						'png': 'png',
					}
					const fileType = fileTypeObj[type] || 'png'

					let width = oWidth
					let height = oHeight

					if (quality < 1) {
						const {
							cWidth,
							cHeight
						} = calcRatioHeightAndWight({
							oWidth,
							oHeight,
							quality,
							orientation
						})

						// 按对折比例缩小
						width = cWidth
						height = cHeight

						// 按对折比例缩小
						that.watermarkCanvasOption.width = width
						that.watermarkCanvasOption.height = height

						that.$nextTick(() => {
							// 获取canvas绘图上下文
							const ctx = uni.createCanvasContext(canvasId, that);

							// 绘制原始图片到canvas上
							ctx.drawImage(imagePath, 0, 0, width, height);

							// 绘制完成后执行的操作，这里不等待绘制完成就继续执行后续操作，因为我们要导出为图片
							ctx.draw(false, () => {
								// #ifndef MP-ALIPAY
								uni.canvasToTempFilePath({ // 将画布内容导出为图片
									canvasId,
									x: 0,
									y: 0,
									width,
									height,
									fileType,
									quality, // 图片的质量，目前仅对 jpg 有效。取值范围为 (0, 1]，不在范围内时当作 1.0 处理。
									destWidth: width,
									destHeight: height,
									success: (res) => {
										console.log('res.tempFilePath',
											res)
										resolve(res.tempFilePath)
									},
									fail() {
										reject(false)
									}
								}, that);
								// #endif

								// #ifdef MP-ALIPAY
								ctx.toTempFilePath({ // 将画布内容导出为图片
									canvasId,
									x: 0,
									y: 0,
									width: width,
									height: height,
									destWidth: width,
									destHeight: height,
									quality,
									fileType,
									success: (res) => {
										console.log('res.tempFilePath',
											res)
										resolve(res.tempFilePath)
									},
									fail() {
										reject(false)
									}
								}, that);
								// #endif 
							});
						})
					} else {
						resolve(imagePath)
					}
				}
			})

		} else {
			const errStr = errLog.join(';')
			showMsg(errStr)
			reject(errStr)
		}
	})
}



// 校验参数
function dealClipImgConfig(options) {
	const valdiateRulesObj = {
		canvasId: '画布id',
		imagePath: '本地图片路径',
		cWidth: '剪裁宽度',
		cHeight: '剪裁高度',
		position: '剪裁位置'
	}

	const defaultConfig = {
		position: 'center',
		cWidth: 500,
		cHeight: 500
	}

	const cOptions = Object.assign(defaultConfig, options)

	const errLog = validateObj(cOptions, valdiateRulesObj)

	const positionArr = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'center']
	if (!positionArr.includes(cOptions.position)) {
		nErrLog.push(`水印项位置不满足【${positionArr.join('/')}】其中之一`)
	}

	if (convertNumber(cOptions.cWidth) <= 10) {
		nErrLog.push('剪裁宽度需大于10')
	}

	if (convertNumber(cOptions.cHeight) <= 10) {
		nErrLog.push('剪裁高度需大于10')
	}

	return {
		errLog,
		config: cOptions
	}
}

// 计算剪切位置
function calcClipPosition(options) {
	const {
		cWidth,
		cHeight,
		position,
		width,
		height
	} = options

	// 开始点
	let calcSX = 0
	let calcSY = 0

	// 结束点
	let calcEX = 0
	let calcEY = 0
	switch (position) {
		case 'topLeft': {
			calcSX = 0
			calcSY = 0
			calcEX = cWidth
			calcEY = cHeight

			break;
		}
		case 'topRight': {
			calcSX = width - cWidth
			calcSY = 0
			calcEX = width
			calcEY = cHeight

			break;
		}

		case 'bottomLeft': {
			calcSX = 0
			calcSY = height - cHeight
			calcEX = cWidth
			calcEY = height

			break;
		}

		case 'bottomRight': {
			calcSX = width - cWidth
			calcSY = height - cHeight
			calcEX = width
			calcEY = height

			break;
		}

		case 'center': {
			calcSX = Math.floor((width - cWidth) / 2)
			calcSY = Math.floor((height - cHeight) / 2)
			calcEX = cWidth + calcSX
			calcEY = cHeight + calcSY

			break;
		}
	}

	return {
		calcSX,
		calcSY,
		calcEX,
		calcEY
	}
}


// 剪切图片
export function clipImg(options, that) {
	return new Promise((resolve, reject) => {
		const {
			errLog,
			config
		} = dealClipImgConfig(options)

		that.watermarkCanvasOption.width = 0
		that.watermarkCanvasOption.height = 0

		if (!errLog.length) {
			const {
				canvasId,
				imagePath,
				cWidth,
				cHeight,
				position
			} = config

			// 获取图片信息，以便获取图片的真实宽高信息
			uni.getImageInfo({
				src: imagePath,
				success: (info) => {
					const {
						width,
						height
					} = info; // 获取图片的原始宽高

					// 自定义剪裁范围要在图片内
					if (width >= cWidth && height >= cHeight) {

						that.watermarkCanvasOption.width = width
						that.watermarkCanvasOption.height = height
						that.$nextTick(() => {
							// 获取canvas绘图上下文
							const ctx = uni.createCanvasContext(canvasId, that);

							const {
								calcSX,
								calcSY,
								calcEX,
								calcEY
							} = calcClipPosition({
								cWidth,
								cHeight,
								position,
								width,
								height
							})

							// 绘制原始图片到canvas上
							ctx.drawImage(imagePath, 0, 0, width, height);

							// 绘制完成后执行的操作，这里不等待绘制完成就继续执行后续操作，因为我们要导出为图片
							ctx.draw(false, () => {
								// #ifndef MP-ALIPAY
								uni.canvasToTempFilePath({ // 将画布内容导出为图片
									canvasId,
									x: calcSX,
									y: calcSY,
									width: cWidth,
									height: cHeight,
									destWidth: cWidth,
									destHeight: cHeight,
									success: (res) => {
										console.log('res.tempFilePath',
											res)
										resolve(res.tempFilePath)
									},
									fail() {
										reject(false)
									}
								}, that);
								// #endif

								// #ifdef MP-ALIPAY
								ctx.toTempFilePath({ // 将画布内容导出为图片
									canvasId,
									x: 0,
									y: 0,
									width: width,
									height: height,
									destWidth: width,
									destHeight: height,
									// fileType: 'png',
									success: (res) => {
										console.log('res.tempFilePath',
											res)
										resolve(res.tempFilePath)
									},
									fail() {
										reject(false)
									}
								}, that);
								// #endif 
							});
						})
					} else {
						return imagePath
					}
				}
			})

		} else {
			const errStr = errLog.join(';')
			showMsg(errStr)
			reject(errStr)
		}
	})
}

// 计算等比缩放的宽高
function calcRatioHeightAndWight(options) {
	const {
		oWidth,
		oHeight,
		quality,
		orientation
	} = options

	let cWidth = Math.floor(oWidth * quality)
	let cHeight = Math.floor(oHeight * quality)

	if (orientation === 'up') {
		return {
			cWidth,
			cHeight
		}
	} else {
		return {
			cWidth: cHeight,
			cHeight: cWidth
		}
	}
}

// 添加水印并压缩
export function addWatermarkAndCompress(options, that, isCompress = false) {
	return new Promise((resolve, reject) => {
		const {
			errLog,
			config
		} = dealWatermarkConfig(options)

		that.watermarkCanvasOption.width = 0
		that.watermarkCanvasOption.height = 0
		if (!errLog.length) {
			const {
				canvasId,
				imagePath,
				watermarkList,
				quality = 0.6
			} = config

			uni.getImageInfo({ // 获取图片信息，以便获取图片的真实宽高信息
				src: imagePath,
				success: (info) => {
					const {
						width: oWidth,
						height: oHeight,
						type,
						orientation
					} = info; // 获取图片的原始宽高
					const fileTypeObj = {
						'jpeg': 'jpg',
						'jpg': 'jpg',
						'png': 'png',
					}
					const fileType = fileTypeObj[type] || 'png'

					let width = oWidth
					let height = oHeight

					if (isCompress) {
						const {
							cWidth,
							cHeight
						} = calcRatioHeightAndWight({
							oWidth,
							oHeight,
							quality,
							orientation
						})

						// 按对折比例缩小
						width = cWidth
						height = cHeight
					}

					that.watermarkCanvasOption.width = width
					that.watermarkCanvasOption.height = height

					that.$nextTick(() => {
						// 获取canvas绘图上下文
						const ctx = uni.createCanvasContext(canvasId, that);
						// 绘制原始图片到canvas上
						ctx.drawImage(imagePath, 0, 0, width, height);
						// 绘制水印项
						const drawWMItem = (ctx, options) => {
							const {
								fontSize,
								color,
								text: cText,
								position,
								margin
							} = options
							// 添加水印
							ctx.setFontSize(fontSize); // 设置字体大小
							ctx.setFillStyle(color); // 设置字体颜色为红色

							if (isNotEmptyArr(cText)) {
								const text = cText.filter(Boolean)
								if (position.startsWith('bottom')) {
									text.reverse()
								}
								text.forEach((str, ind) => {
									const textMetrics = ctx.measureText(str);
									const {
										calcX,
										calcY
									} = calcPosition({
										height,
										width,
										position,
										margin,
										ind,
										fontSize,
										textMetrics
									})
									ctx.fillText(str, calcX, calcY, width);
								})
							} else {
								const textMetrics = ctx.measureText(cText);

								const {
									calcX,
									calcY
								} = calcPosition({
									height,
									width,
									position,
									margin,
									ind: 0,
									fontSize,
									textMetrics
								})
								// 在图片底部添加水印文字
								ctx.fillText(text, calcX, calcY, width);
							}
						}

						watermarkList.forEach(ele => {
							drawWMItem(ctx, ele)
						})

						// 绘制完成后执行的操作，这里不等待绘制完成就继续执行后续操作，因为我们要导出为图片
						ctx.draw(false, () => {
							// #ifndef MP-ALIPAY
							uni.canvasToTempFilePath({ // 将画布内容导出为图片
								canvasId,
								x: 0,
								y: 0,
								width,
								height,
								fileType,
								quality, // 图片的质量，目前仅对 jpg 有效。取值范围为 (0, 1]，不在范围内时当作 1.0 处理。
								destWidth: width,
								destHeight: height,
								success: (res) => {
									console.log('res.tempFilePath', res)
									resolve(res.tempFilePath)
								},
								fail() {
									reject(false)
								}
							}, that);
							// #endif

							// #ifdef MP-ALIPAY
							ctx.toTempFilePath({ // 将画布内容导出为图片
								canvasId,
								x: 0,
								y: 0,
								width: width,
								height: height,
								destWidth: width,
								destHeight: height,
								quality,
								fileType,
								success: (res) => {
									console.log('res.tempFilePath', res)
									resolve(res.tempFilePath)
								},
								fail() {
									reject(false)
								}
							}, that);
							// #endif 
						});
					})
				}
			});
		} else {
			const errStr = errLog.join(';')
			showMsg(errStr)
			reject(errStr)
		}
	})
}

// 判断是否在微信中
function isWechat() {
	var ua = window.navigator.userAgent.toLowerCase();
	if (ua.match(/micromessenger/i) == 'micromessenger') {
		console.log('是微信客户端')
		return true;
	} else {
		console.log('不是微信客户端')
		return false;
	}
}


// 通过微信jssdk使得微信H5获取定位
function getLocationByWxH5() {
	let jweixin = require('jweixin-module');
	return new Promise((resolve, reject) => {
		if (jweixin) {
			const ruleObj = {
				appId: '公众号的appId',
				timestamp: '生成签名的时间戳',
				nonceStr: '生成签名的随机串',
				signature: '签名',
			}

			const errLog = validateObj(data, ruleObj)
			if (errLog.length) {
				showMsg(errLog.join(';'))
				reject(false);
			} else {
				jweixin.config({
					debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
					appId: data.appId, // 必填，公众号的唯一标识
					timestamp: data.timestamp, // 必填，生成签名的时间戳
					nonceStr: data.nonceStr, // 必填，生成签名的随机串
					signature: data.signature, // 必填，签名，见附录1
					jsApiList: ['getLocation'], // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
					openTagList: ['wx-open-launch-weapp'] // 微信开放标签 小程序跳转按钮
				});
				jweixin.ready(function() {
					jweixin.checkJsApi({
						jsApiList: ['getLocation'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
						success: function(res) {
							console.log('checkjsapi Success')
						},
						fail: function(res) {
							resolve(false);
						}
					});
					jweixin.getLocation({
						type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
						success: function(res) {
							resolve(res);
						},
						fail: function(res) {
							showMsg('获取附近地址失败！请检查网络,GPS定位是否开启以及微信地理位置授权等情况！')
							reject(false);
						}
					});
				});

				jweixin.error(function(res) {
					console.log('error', res)
					showMsg('微信jssdk方法调用失败')
					reject(false)
				});
			}

		} else {
			showMsg('微信jssdk加载失败')
			reject(false)
		}
	})
}