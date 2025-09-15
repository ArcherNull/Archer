import api from "@/utils/servers/api";
import config from './servers/config'
import {
	router
} from '@/router'
import gbk from '@/components/kk-printer/utils/printUtil-GBK.js';
let BLEState = false
export default {
	// js截取最后一个横线前的数据
	getDataBeforeLastPipe(str) {
		var lastIndex = str.lastIndexOf('-');
		if (lastIndex > -1) {
			console.log(str.substring(0, lastIndex))
			return str.substring(0, lastIndex);
		}
		return str;
	},
	/**
	 * 在当前时间上加指定小时数，返回格式化时间
	 * @param {number} addHours - 需添加的小时数
	 * @returns {string} 格式化时间（年-月-日 时:分:秒）
	 */
	getTimeAfterHours(addHours) {
		const currentTime = new Date().getTime();
		const targetTime = currentTime + addHours * 60 * 60 * 1000;
		const targetDate = new Date(targetTime);
		const format = (num) => num < 10 ? `0${num}` : num;
		return `${targetDate.getFullYear()}-${format(targetDate.getMonth() + 1)}-${format(targetDate.getDate())} ${format(targetDate.getHours())}:${format(targetDate.getMinutes())}:${format(targetDate.getSeconds())}`;
	},
	// 包含几个特定字符
	countOccurrences(str, char) {
		const regex = new RegExp(char, "g");
		const matches = str.match(regex);
		return matches ? matches.length : 0;
	},
	//   手机号脱敏
	maskPhone(phone) {
		return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
	},
	splitContactInfo(contactInfo) {
		// 正则表达式用于匹配姓名、电话和地址
		const regex = /^(\S+)\s*(\S+)(?:\s*(\S+))?(?:\s*(.+))?$/;
		const matches = contactInfo.match(regex);

		if (matches) {
			// 匹配成功，返回姓名、电话和地址的对象
			return {
				name: matches[1],
				phone: matches[2],
				address: matches[3].toString()
			};
		} else {
			// 匹配失败，返回null
			return null;
		}
	},
	// 连接状态值
	getBLEState() {
		return BLEState
	},
	// 上传图片
	upChooseImage(type, callBack) {
		uni.chooseImage({
			count: 1,
			success(res) {
				if (res.tempFilePaths.length > 0) {
					// #ifdef APP-PLUS
					uni.compressImage({
						src: res.tempFilePaths[0],
						quality: 0.1, //图片压缩质量
						width: '50%', //缩放图片的宽度
						height: '50%', //缩放图片的高度
						success: res => {
							uni.showLoading({})
							uni.uploadFile({
								url: config.api.serviceUrl +
									'/order/api/v1/pub/upload/upLoadImg', //仅为示例，非真实的接口地址
								filePath: res.tempFilePath,
								name: 'file',
								formData: {
									'type': type
								},
								header: {
									'Authorization': uni.getStorageSync('token'),
									'system_type': 0
								},
								success: ({
									data
								}) => {
									uni.hideLoading()
									callBack && callBack(data)
								}
							});
						}
					})
					// #endif
					// H5环境
					//#ifdef H5 || MP-WEIXIN  
					uni.showLoading({})
					uni.uploadFile({
						url: config.api.serviceUrl +
							'/order/api/v1/pub/upload/upLoadImg', //仅为示例，非真实的接口地址
						filePath: res.tempFilePaths[0],
						name: 'file',
						formData: {
							'type': type
						},
						header: {
							'Authorization': uni.getStorageSync('token'),
							'system_type': 0
						},
						success: ({
							data
						}) => {
							uni.hideLoading()
							callBack && callBack(data)
						}
					});
					//#endif
				}
			},
		});
	},
	// 页面跳转
	commonJump(path, clear = false, callback) {
		if (!path) {
			console.warn('请检查跳转地址，跳转地址为空')
			return
		}
		if (clear) {
			uni.reLaunch({
				url: path,
			});
		} else {
			let tabbarUrl = ['/pages/demand/index', '/pages/soure/index', '/pages/mine/index'];
			if (tabbarUrl.includes(path)) {
				uni.switchTab({
					url: path
				})
			} else {
				uni.navigateTo({
					url: path,
					success: callback
				});
			}
		}
	},

	// 页面弹出框
	commonToast(title, type = 'none', callback, duration = 2000) {
		var toastParams = {
			title: title,
			duration,
			icon: type,
			mask: true,
		}
		uni.showToast(
			toastParams
		);
		if (callback) {
			setTimeout(() => {
				callback()
			}, duration);
		}
	},

	// 页面弹出模态框
	commonMoadl(params) {
		uni.showModal({
			title: params.title, // 提示标题
			content: params.content, // 提示内容
			showCancel: params.showCancel, // 是否显示取消按钮
			cancelText: params.cancelText, // 取消文字按钮
			confirmText: params.confirmText, // 确认按钮文字
			confirmColor: '#443FF8', // 确认文字颜色
			success: (res) => {
				if (res.confirm) {
					params.success && params.success()
				} else if (res.cancel) {
					params.cancel && params.cancel()
				}
			},
		});
	},

	// 刷新token('tmsUser/findMyInfo', 'shipping/receivedList'  调用失败，错误信息包含token时需要刷新token)
	refreshToken() {
		return new Promise((resolve, reject) => {
			api.refreshToken({
				grant_type: 'refresh_token',
				refresh_token: uni.getStorageSync("refresh_token")
			}, {
				success: (ret) => {
					if (ret.code == 1) {
						uni.setStorageSync("token", "Bearer " + res.data.data.access_token);
						uni.setStorageSync("refresh_token", res.data.data.refresh_token);
						resolve();
					}
				},
				error: (err) => {
					uni.removeStorageSync('token')
					uni.removeStorageSync('user')
					uni.removeStorageSync('userId')
					uni.removeStorageSync('subjectId')
					uni.removeStorageSync('refresh_token')
					router.push({
						name: 'login',
						params: {}
					})
					reject();
				}
			});
		})
	},

	// 时间函数
	getTime(isHMS = false, advanceTime = 0) {
		const time = new Date(new Date().getTime() - advanceTime * 24 * 60 * 60 * 1000)
		const year = time.getFullYear() //年
		const month = (time.getMonth() + 1).toString().padStart(2, '0') //月
		const day = time.getDate().toString().padStart(2, '0') //日
		const h = time.getHours().toString().padStart(2, '0') //时
		const m = time.getMinutes().toString().padStart(2, '0') //分
		const s = time.getSeconds().toString().padStart(2, '0') //秒
		if (isHMS) {
			return `${year}-${month}-${day} ${h}:${m}:${s}`
		} else {
			return `${year}-${month}-${day}`
		}
	},

	// 页面传参数据处理
	transmitArguments(data) {
		let obj = {}
		Object.keys(data).forEach((i) => {
			obj[i] = data[i] ? data[i] : ''
		})
		return JSON.stringify(obj)
	},
	// 价格查询下拉
	pickerArr: [{
			show: false,
			columns: [
				[{
						name: "09点",
					},
					{
						name: "10点",
					},
					{
						name: "11点",
					},
					{
						name: "12点",
					},
					{
						name: "13点",
					},
					{
						name: "14点",
					},
					{
						name: "15点",
					},
					{
						name: "16点",
					},
					{
						name: "17点",
					},
					{
						name: "18点",
					},
					{
						name: "19点",
					},
					{
						name: "20点",
					},
					{
						name: "21点",
					},
				],
			],
			tag: "time",
			name: ''
		}, //定时送（正常时段）下拉0
		{
			show: false,
			columns: [
				[{
						name: "22点",
					},
					{
						name: "23点",
					},
					{
						name: "24点",
					},
					{
						name: "01点",
					},
					{
						name: "02点",
					},
					{
						name: "03点",
					},
					{
						name: "04点",
					},
					{
						name: "05点",
					},
					{
						name: "06点",
					},
					{
						name: "07点",
					},
					{
						name: "08点",
					},
				],
			],
			tag: "nightTime",
			name: ''
		}, //定时送（晚上）下拉1

		{
			show: false,
			columns: [
				[{
						name: "有电梯",
					},
					{
						name: "无电梯",
					},
				],
			],
			tag: "elevator",
			name: ''
		}, //上楼2
		{
			show: false,
			columns: [],
			tag: "startPoint",
			name: '开单网点'
		}, //开单网点下拉3
		{
			show: false,
			columns: [
				[{
						name: '深圳',
						code: 142
					},
					{
						name: '苏州',
						code: 143
					},
					{
						name: '杭州',
						code: 144
					},
					{
						name: '武汉',
						code: 145
					},
					{
						name: '郑州',
						code: 146
					},
					{
						name: '广州',
						code: 147
					},
					{
						name: '嘉定',
						code: 148
					},
					{
						name: '昆山',
						code: 149
					},
					{
						name: '无锡',
						code: 192
					},
					{
						name: '北京',
						code: 639
					},
					{
						name: '天津',
						code: 640
					},
					{
						name: '嘉兴',
						code: 641
					},
					{
						name: '南昌',
						code: 642
					},
					{
						name: '宁波',
						code: 643
					},
					{
						name: '台州',
						code: 644
					},
					{
						name: '温州',
						code: 645
					},
					{
						name: '义乌',
						code: 646
					},
					{
						name: '余姚',
						code: 647
					},
					{
						name: '赣州',
						code: 648
					},
					{
						name: '济南',
						code: 649
					},
					{
						name: '青岛',
						code: 650
					},
					{
						name: '临沂',
						code: 651
					},
					{
						name: '徐州',
						code: 652
					},
					{
						name: '常州',
						code: 653
					},
					{
						name: '合肥',
						code: 654
					},
					{
						name: '南京',
						code: 655
					},
					{
						name: '松江',
						code: 656
					},
					{
						name: '西安',
						code: 657
					},
					{
						name: '成都',
						code: 658
					},
					{
						name: '重庆',
						code: 659
					},

					{
						name: '昆明',
						code: 660
					},
					{
						name: '贵阳',
						code: 661
					},
					{
						name: '常州2',
						code: 1470
					},
					{
						name: '永康',
						code: 1472
					},
					{
						name: '金山',
						code: 1473
					},
					{
						name: '惠山',
						code: 1474
					},
					{
						name: '中山',
						code: 1475
					},
					{
						name: '长沙',
						code: 1476
					},
					{
						name: '长春',
						code: 1477
					},
					{
						name: '漳州',
						code: 1478
					},
					{
						name: '玉林',
						code: 1479
					},
					{
						name: '宜昌',
						code: 1480
					},
					{
						name: '襄阳',
						code: 1481
					},
					{
						name: '梧州',
						code: 1482
					},
					{
						name: '银川',
						code: 1483
					},
					{
						name: '西宁',
						code: 1484
					},
					{
						name: '乌鲁木齐',
						code: 1485
					},
					{
						name: '兰州',
						code: 1486
					},
					{
						name: '拉萨',
						code: 1487
					},
					{
						name: '呼和浩特',
						code: 1488
					},
					{
						name: '鄂尔多斯',
						code: 1489
					},
					{
						name: '包头',
						code: 1490
					},
					{
						name: '太原',
						code: 1491
					},
					{
						name: '石家庄',
						code: 1492
					},
					{
						name: '沈阳',
						code: 1493
					},
					{
						name: '厦门',
						code: 1494
					},
					{
						name: '泉州',
						code: 1495
					},
					{
						name: '南宁',
						code: 1496
					},
					{
						name: '柳州',
						code: 1497
					},
					{
						name: '荆州',
						code: 1498
					},
					{
						name: '怀化',
						code: 1499
					},
					{
						name: '贺州',
						code: 1500
					},
					{
						name: '海口',
						code: 1501
					},
					{
						name: '哈尔滨',
						code: 1502
					},
					{
						name: '桂林',
						code: 1503
					},
					{
						name: '贵港',
						code: 1504
					},

					{
						name: '佛山',
						code: 1505
					},
					{
						name: '三明',
						code: 1506
					},
					{
						name: '南平',
						code: 1507
					},
					{
						name: '龙岩',
						code: 1508
					},
					{
						name: '福州',
						code: 1509
					},
					{
						name: '北海',
						code: 1510
					},
					{
						name: '凭祥',
						code: 1576
					},
					{
						name: '东莞',
						code: 1600
					},
					{
						name: '潍坊',
						code: 1675
					},
					{
						name: '巴彦淖尔',
						code: 1938
					},
				],
			],
			tag: "startStation",
			name: ''
		}, //始发站4
		{
			show: false,
			columns: [],
			tag: "itemNames",
			name: '品名'
		}, //品名下拉5
		{
			show: false,
			columns: [],
			tag: "packUnits",
			name: '包装'
		}, //包装下拉6
		{
			show: false,
			columns: [],
			tag: "handoverMode",
			name: '交接方式'
		}, //交接方式下拉7
		{
			show: false,
			columns: [],
			tag: "transportMode",
			name: '运输方式'
		}, //产品名称下拉8
		{
			show: false,
			columns: [],
			tag: "receiptRequirement",
			name: '回单要求'
		}, //回单要求下拉9

		{
			show: false,
			columns: [],
			tag: "pickUpMethod",
			name: '接货方式'
		}, //接货方式下拉10
		{
			show: false,
			columns: [],
			tag: "paymentMethod",
			name: '付款方式'
		}, //付款方式下拉11
	],
	sleep(delay) {
		var start = (new Date()).getTime();
		while ((new Date()).getTime() - start < delay) {
			continue;
		}
	},
	// 标签模板
	getLabelTemplate(data) {
		var json = data
		var labelTemplate = ''
		var url =
			'0000000000000000000000000000000000000000000000000000003F00000000000000FFC0000000000001FFE0000000000003FFF0000000000007FFF800000000000FFFFC00000000001FFFFE00000000003FFFFF00000000007FFFFF8000000000FFFFFFC000000000FFF3FFC0000000007FE1FF80000000003FC0FF000000000C3F807F0C0000001C4F003C9E0000003F8600187F0000007F8000007F800000FFC00000FFC00001FFE00001FFE00003FFE00001FFF00007FFC00000FFF8000FFF8000007FFC000FFF0000003FFC001FFE0000001FFE001FFC0000000FFE001FF800000007FE001FF800000007FE001FFC0000000FFE001FFE0000001FFE000FFF0000003FFC000FFF8000007FFC0007FFC00000FFF80003FFE00001FFF00001FFE00001FFE00000FFC00000FFC000007F8000007F8000003F8600187F0000001E4F003C9E0000000C3F807F0C000000003FC0FF00000000007FE1FF8000000000FFF3FFC000000000FFFFFFC0000000007FFFFF80000000003FFFFF00000000001FFFFE00000000000FFFFC000000000007FFF8000000000003FFF0000000000001FFE0000000000000FFC00000000000003F00000000000000000000000000000000000000000000000000000000'
		// 标签
		labelTemplate += '! 0 200 200 490 1\r\n'
		labelTemplate += 'GAP-SENSE\r\n'

		// labelTemplate += 'VB QR 10 430 M 2 U 2\r\n'
		// labelTemplate += `MA,${json.QRCode}\r\n`
		// labelTemplate += 'ENDQR\r\n'

		// labelTemplate += `EG 8 58 7 380 ${url}\r\n`

		labelTemplate += `VBARCODE 128 2 1 50 10 370 ${json.QRCode}\r\n`
		labelTemplate += 'BOX 65 0 520 440 1 \r\n'

		labelTemplate += 'SETMAG 2 2\r\n'
		labelTemplate += 'SETBOLD 2\r\n'
		labelTemplate += `VTEXT 3 1 80 325 ${json.code}\r\n`
		labelTemplate += 'SETBOLD 0\r\n'
		labelTemplate += 'SETMAG 0 0\r\n'

		if (json.startPoint == '盛聚拼多多项目部') {
			labelTemplate += 'SETMAG 2 2\r\n'
			labelTemplate += 'SETBOLD 2\r\n'
			labelTemplate += `VTEXT 55 0 88 80 -${json.currentCopyCode}\r\n`
			labelTemplate += 'SETBOLD 0\r\n'
			labelTemplate += 'SETMAG 0 0\r\n'
		}

		labelTemplate += 'VTEXT 3 0 91 425 运单号\r\n'
		labelTemplate += `VTEXT 3 1 157 105 ${json.quantity}件\r\n`
		labelTemplate += `VTEXT 3 0 157 275 ${json.shipMan}\r\n`
		labelTemplate += 'VTEXT 3 0 157 410 发货\r\n'
		if (json.startPoint == '盛聚拼多多项目部') {
			labelTemplate += `VTEXT 3 0 221 350 ${json.transitStationName}${json.transitStationName ? '-' : ''}\r\n`
			labelTemplate += 'SETMAG 2 2\r\n'
			labelTemplate += 'SETBOLD 2\r\n'
			labelTemplate += `VTEXT 55 0 215 270 ${json.receivedCompany}\r\n`
			labelTemplate += 'SETBOLD 0\r\n'
			labelTemplate += 'SETMAG 0 0\r\n'
		} else {
			labelTemplate += `VTEXT 3 0 221 260 ${json.transitStationName}\r\n`
		}
		labelTemplate += 'VTEXT 3 0 221 410 目的\r\n'
		labelTemplate += `VTEXT 3 0 285 100 ${json.packUnits}\r\n`
		labelTemplate += 'VTEXT 3 0 285 180 包装\r\n'
		labelTemplate += `VTEXT 3 0 285 315 ${json.itemNames}\r\n`
		labelTemplate += 'VTEXT 3 0 285 410 品名\r\n'
		labelTemplate += `VTEXT 3 1 349 100 ${json.volume}\r\n`
		labelTemplate += 'VTEXT 3 0 349 175 计体\r\n'
		labelTemplate += `VTEXT 3 1 349 330 ${json.weight}\r\n`
		labelTemplate += 'VTEXT 3 0 349 410 计重\r\n'
		labelTemplate += `VTEXT 3 0 413 100 ${json.handoverMode}\r\n`
		labelTemplate += `VTEXT 3 0 413 280 ${json.receivedMan}\r\n`
		labelTemplate += 'VTEXT 3 0 413 410 收货\r\n'
		labelTemplate += `VTEXT 3 0 477 285 ${json.destinationPoint}\r\n`
		labelTemplate += 'VTEXT 3 0 477 410 终端\r\n'
		labelTemplate += 'LINE 136 0 136 440 1\r\n'
		labelTemplate += 'LINE 200 0 200 440 1\r\n'
		labelTemplate += 'LINE 264 0 264 440 1\r\n'
		labelTemplate += 'LINE 328 0 328 440 1\r\n'
		labelTemplate += 'LINE 392 0 392 440 1\r\n'
		labelTemplate += 'LINE 456 0 456 440 1\r\n'
		labelTemplate += 'LINE 65 350 136 350 1\r\n'
		labelTemplate += 'LINE 136 125 200 125 1\r\n'
		labelTemplate += 'LINE 264 115 456 115 1\r\n'
		labelTemplate += 'LINE 264 195 392 195 1\r\n'
		labelTemplate += 'LINE 136 350 520 350 1\r\n'
		//   labelTemplate += `TEXT 3 0 544 410  ${json.startPoint}\r\n`
		labelTemplate += `VTEXT 3 0 524 445  ${json.startPoint}\r\n`
		//   labelTemplate += `VTEXT 3 0 544 410  ${json.time}\r\n`
		if (json.startPoint == '盛聚拼多多项目部') {
			labelTemplate += 'SETMAG 3 3\r\n'
			labelTemplate += 'SETBOLD 2\r\n'
			labelTemplate += `VTEXT 55 0 525 121 德坤\r\n`
			labelTemplate += 'SETBOLD 0\r\n'
			labelTemplate += 'SETMAG 0 0\r\n'
		}
		labelTemplate += `VTEXT 3 0 552 445  ${json.time}\r\n`
		labelTemplate += 'FORM\r\n'
		labelTemplate += 'PRINT\r\n'
		return labelTemplate
	},
	// 浩运标签模版
	getHYLabelTemplate(data) {
		var json = data

		const getVal = (field) => {
			return field ? (json[field] || '') : ''
		}

		var labelTemplate = ''
		var url =
			'0000000000000000000000000000000000000000000000000000003F00000000000000FFC0000000000001FFE0000000000003FFF0000000000007FFF800000000000FFFFC00000000001FFFFE00000000003FFFFF00000000007FFFFF8000000000FFFFFFC000000000FFF3FFC0000000007FE1FF80000000003FC0FF000000000C3F807F0C0000001C4F003C9E0000003F8600187F0000007F8000007F800000FFC00000FFC00001FFE00001FFE00003FFE00001FFF00007FFC00000FFF8000FFF8000007FFC000FFF0000003FFC001FFE0000001FFE001FFC0000000FFE001FF800000007FE001FF800000007FE001FFC0000000FFE001FFE0000001FFE000FFF0000003FFC000FFF8000007FFC0007FFC00000FFF80003FFE00001FFF00001FFE00001FFE00000FFC00000FFC000007F8000007F8000003F8600187F0000001E4F003C9E0000000C3F807F0C000000003FC0FF00000000007FE1FF8000000000FFF3FFC000000000FFFFFFC0000000007FFFFF80000000003FFFFF00000000001FFFFE00000000000FFFFC000000000007FFF8000000000003FFF0000000000001FFE0000000000000FFC00000000000003F00000000000000000000000000000000000000000000000000000000'
		// 标签
		labelTemplate += '! 0 200 200 700 1\r\n'
		labelTemplate += 'GAP-SENSE\r\n'
		labelTemplate += 'PREFEED 10\r\n'

		// labelTemplate += 'VB QR 10 430 M 2 U 2\r\n'
		// labelTemplate += `MA,${getVal("QRCode}\r\n`
		// labelTemplate += 'ENDQR\r\n'

		labelTemplate += `EG 8 58 15 5 ${url}\r\n`
		labelTemplate += `BARCODE 128 2 1 50 100 10 ${getVal("QRCode")}\r\n`
		labelTemplate += 'BOX 10 70 440 490 1 \r\n'

		labelTemplate += 'TEXT 3 0 25 90 运单号\r\n'
		labelTemplate += 'SETMAG 2 2\r\n'
		labelTemplate += `TEXT 3 0 130 75 ${getVal("code")}\r\n`
		labelTemplate += 'SETMAG 0 0\r\n'
		labelTemplate += 'TEXT 3 0 35 150 发货\r\n'
		labelTemplate += `TEXT 3 0 130 150 ${getVal("shipMan")}\r\n`
		labelTemplate += `TEXT 3 0 360 150 ${getVal("quantity")}件\r\n`
		labelTemplate += 'TEXT 3 0 35 210 目的\r\n'
		// labelTemplate += `TEXT 3 0 130 210 ${getVal("networkDestination")}\r\n`
		labelTemplate += `TEXT 3 0 130 210 ${getVal("desitiantionSataion")}--${getVal("shortNetworkDestination")}\r\n`
		labelTemplate += 'TEXT 3 0 35 270 品名\r\n'
		labelTemplate += `TEXT 3 0 130 270 ${getVal("itemNames")}\r\n`
		labelTemplate += 'TEXT 3 0 35 330 计重\r\n'
		labelTemplate += `TEXT 3 0 130 330 ${getVal("weight")}\r\n`
		labelTemplate += 'TEXT 3 0 35 390 收货\r\n'
		labelTemplate += `TEXT 3 0 130 390 ${getVal("receivedMan")}\r\n`
		labelTemplate += 'TEXT 3 0 35 450 终端\r\n'
		labelTemplate += `TEXT 3 0 130 450 ${getVal("destinationPoint")}\r\n`
		labelTemplate += 'TEXT 3 0 275 270 包装\r\n'
		labelTemplate += `TEXT 3 0 360 270 ${getVal("packUnits")}\r\n`
		labelTemplate += 'TEXT 3 0 275 330 计体\r\n'
		labelTemplate += `TEXT 3 0 360 330 ${getVal("volume")}\r\n`
		labelTemplate += `TEXT 3 0 360 390 ${getVal("handoverMode")}\r\n`
		labelTemplate += `TEXT 3 0 20 500 ${getVal("startPoint")}\r\n`
		labelTemplate += `TEXT 3 0 20 525 ${getVal("orderDate")}\r\n`
		labelTemplate += 'LINE 0 130 440 130 1\r\n'
		labelTemplate += 'LINE 0 190 440 190 1\r\n'
		labelTemplate += 'LINE 0 250 440 250 1\r\n'
		labelTemplate += 'LINE 0 310 440 310 1\r\n'
		labelTemplate += 'LINE 0 370 440 370 1\r\n'
		labelTemplate += 'LINE 0 430 440 430 1\r\n'
		labelTemplate += 'LINE 100 70 100 490 1\r\n'
		labelTemplate += 'LINE 340 130 340 190 1\r\n'
		labelTemplate += 'LINE 250 250 250 370 1\r\n'
		labelTemplate += 'LINE 340 250 340 430 1\r\n'

		labelTemplate += 'FORM\r\n'
		labelTemplate += 'PRINT\r\n'
		return labelTemplate
	},
	// 普通运单模板
	getWaybillTemplate(wybillData) {
		var json = wybillData

		const getVal = (field) => {
			return field ? (json[field] || '') : ''
		}

		var waybillTemplate = ''
		// 运单
		waybillTemplate += '! 0 200 200 1100 1\r\n'
		waybillTemplate += 'PAGE-WIDTH 760 \r\n'
		waybillTemplate += 'BOX 1 60 570 1030 1\r\n'
		waybillTemplate += 'SETMAG 2 2\r\n'
		waybillTemplate += `TEXT 55 0 0 6 德坤 ${getVal("companyname")}\r\n`
		waybillTemplate += 'SETBOLD 2\r\n'
		waybillTemplate += `TEXT 3 0 70 75 ${getVal("startStation")}\r\n`
		waybillTemplate += 'SETBOLD 0\r\n'
		waybillTemplate += 'TEXT 3 0 272 75 至\r\n'
		waybillTemplate += 'SETBOLD 2\r\n'
		waybillTemplate += `TEXT 3 0 364 75 ${getVal("desitiantionSataion")}\r\n`
		waybillTemplate += 'SETBOLD 0\r\n'

		waybillTemplate += 'TEXT 3 0 0 122 开单网点：\r\n'
		waybillTemplate += `TEXT 3 0 121 122 ${getVal("startPoint")}\r\n`
		waybillTemplate += 'TEXT 3 0 330 122 电话：\r\n'
		waybillTemplate += `TEXT 3 0 400 122 ${getVal("startPointPhone")}\r\n`

		waybillTemplate += 'TEXT 3 0 0 168 目的网点：\r\n'
		waybillTemplate += `TEXT 3 0 121 168 ${getVal("destinationPoint")}\r\n`
		waybillTemplate += 'TEXT 3 0 330 168 电话：\r\n'
		waybillTemplate += `TEXT 3 0 400 168 ${getVal("destinationPhone")}\r\n`

		waybillTemplate += 'TEXT 3 0 0 214 提货地址：\r\n'
		waybillTemplate += `TEXT 3 0 121 214 ${getVal("takeAddress")}\r\n`

		waybillTemplate += 'TEXT 3 0 0 260 运输方式：\r\n'
		waybillTemplate += `TEXT 3 0 121 260 ${getVal("transportMode")}\r\n`

		waybillTemplate += 'TEXT 3 0 220 260 运单号\r\n'
		waybillTemplate += 'SETMAG 2 2\r\n'
		waybillTemplate += `TEXT 3 0 305 246 ${getVal("code")}\r\n`

		waybillTemplate += 'SETMAG 1 1\r\n'
		waybillTemplate += 'TEXT 3 0 12 300 收\r\n'
		waybillTemplate += 'TEXT 3 0 12 346 货\r\n'
		waybillTemplate += 'TEXT 3 0 12 392 方\r\n'

		waybillTemplate += 'TEXT 3 0 50 444 发货人：\r\n'
		waybillTemplate += `TEXT 3 0 161 444 ${getVal("shipMan")}\r\n`
		waybillTemplate += 'TEXT 3 0 50 490 电话：\r\n'
		waybillTemplate += `TEXT 3 0 130 490 ${getVal("shipManPhone")}\r\n`

		waybillTemplate += 'TEXT 3 0 12 668 费\r\n'
		waybillTemplate += 'TEXT 3 0 12 714 用\r\n'
		waybillTemplate += 'TEXT 3 0 12 760 信\r\n'
		waybillTemplate += 'TEXT 3 0 12 806 息\r\n'

		waybillTemplate += 'TEXT 3 0 50 536 品名：\r\n'
		waybillTemplate += `TEXT 3 0 130 536 ${getVal("itemNames")}\r\n`
		waybillTemplate += 'TEXT 3 0 263 536 包装：\r\n'
		waybillTemplate += `TEXT 3 0 343 536 ${getVal("packUnits")}\r\n`

		waybillTemplate += 'TEXT 3 0 50 582 重量：\r\n'
		waybillTemplate += `TEXT 3 0 130 582 ${getVal("weight")}\r\n`
		waybillTemplate += 'TEXT 3 0 225 582 体积：\r\n'
		waybillTemplate += `TEXT 3 0 305 582 ${getVal("volume")}\n`
		waybillTemplate += 'TEXT 3 0 400 582 件数：\r\n'
		waybillTemplate += `TEXT 3 0 480 582 ${getVal("quantity")}\r\n`

		waybillTemplate += 'TEXT 3 0 50 628 运费：\r\n'
		waybillTemplate += `TEXT 3 0 130 628 ${getVal("receivedTransferFee")}\r\n`

		waybillTemplate += 'TEXT 3 0 50 674 代收货款：\r\n'
		waybillTemplate += `TEXT 3 0 171 674 ${getVal("collectionGoodsFee")}\r\n`
		waybillTemplate += 'TEXT 3 0 225 674 手续费：\r\n'
		waybillTemplate += `TEXT 3 0 336 674 ${getVal("collectionProceduresFee")}\r\n`
		waybillTemplate += 'TEXT 3 0 400 674 其他费：\r\n'
		waybillTemplate += `TEXT 3 0 511 674 ${getVal("otherFee")}\r\n`

		waybillTemplate += 'TEXT 3 0 50 720 折扣折让：\r\n'
		waybillTemplate += `TEXT 3 0 171 720 ${getVal("disCountFee")}\r\n`
		waybillTemplate += 'TEXT 3 0 225 720 送货费：\r\n'
		waybillTemplate += `TEXT 3 0 336 720 ${getVal("deliveryFee")}\r\n`
		waybillTemplate += 'TEXT 3 0 400 720 接货费：\r\n'
		waybillTemplate += `TEXT 3 0 511 720 ${getVal("pickUpFee")}\r\n`

		waybillTemplate += 'TEXT 3 0 50 766 声明价值：\r\n'
		waybillTemplate += `TEXT 3 0 171 766 ${getVal("declareValue")}\r\n`
		waybillTemplate += 'TEXT 3 0 225 766 保价费：\r\n'
		waybillTemplate += `TEXT 3 0 336 766 ${getVal("guaranteedFee")}\r\n`
		waybillTemplate += 'TEXT 3 0 400 766 回单费：\r\n'
		waybillTemplate += `TEXT 3 0 511 766 ${getVal("receiptFee")}\r\n`

		waybillTemplate += 'TEXT 3 0 50 812 装卸费：\r\n'
		waybillTemplate += `TEXT 3 0 161 812 ${getVal("loadingUnloadingFee")}\r\n`
		waybillTemplate += 'TEXT 3 0 225 812 进仓费：\r\n'
		waybillTemplate += `TEXT 3 0 336 812 ${getVal("entryFee")}\r\n`
		waybillTemplate += 'TEXT 3 0 400 812 上楼费：\r\n'
		waybillTemplate += `TEXT 3 0 511 812 ${getVal("upStairFee")}\r\n`

		waybillTemplate += 'TEXT 3 0 50 858 付款方式：\r\n'
		waybillTemplate += `TEXT 3 0 171 858 ${getVal("paymentMethod")}${getVal("totalShipFee")}元\r\n`

		waybillTemplate += 'TEXT 3 0 50 904 交接方式：\r\n'
		waybillTemplate += `TEXT 3 0 171 904 ${getVal("handoverMode")}\r\n`

		waybillTemplate += 'TEXT 3 0 263 904 回单要求：\r\n'
		waybillTemplate += `TEXT 3 0 384 904 ${getVal("receiptRequirement")}${getVal("receiptQty")}\r\n`

		waybillTemplate += 'TEXT 3 0 50 950 备注：\r\n'
		waybillTemplate += `TEXT 3 0 130 950 ${getVal("remarks")}\r\n`

		waybillTemplate += 'TEXT 3 0 0 996 开单日期：\r\n'
		waybillTemplate += `TEXT 3 0 121 996 ${getVal("orderDate")}\r\n`
		waybillTemplate += 'TEXT 3 0 360 996 制单人：\r\n'
		waybillTemplate += `TEXT 3 0 471 996 ${getVal("orderMan")}\r\n`

		waybillTemplate += 'LINE 0 110 570 110 1\r\n'
		waybillTemplate += 'LINE 0 156 570 156 1\r\n'
		waybillTemplate += 'LINE 0 202 570 202 1\r\n'
		waybillTemplate += 'LINE 0 248 570 248 1\r\n'
		waybillTemplate += 'LINE 0 294 570 294 1\r\n'

		waybillTemplate += 'LINE 50 386 570 386 1\r\n'
		waybillTemplate += 'LINE 0 432 570 432 1\r\n'

		waybillTemplate += 'LINE 0 524 570 524 1\r\n'
		waybillTemplate += 'LINE 50 570 570 570 1\r\n'
		waybillTemplate += 'LINE 50 616 570 616 1\r\n'
		waybillTemplate += 'LINE 50 662 570 662 1\r\n'
		waybillTemplate += 'LINE 50 708 570 708 1\r\n'
		waybillTemplate += 'LINE 50 754 570 754 1\r\n'
		waybillTemplate += 'LINE 50 800 570 800 1\r\n'
		waybillTemplate += 'LINE 50 846 570 846 1\r\n'
		waybillTemplate += 'LINE 50 892 570 892 1\r\n'
		waybillTemplate += 'LINE 50 938 570 938 1\r\n'
		waybillTemplate += 'LINE 0 984 570 984 1\r\n'

		waybillTemplate += 'LINE 0 984 570 984 1\r\n'

		waybillTemplate += 'LINE 262 60 262 110 1\r\n'
		waybillTemplate += 'LINE 314 60 314 110 1\r\n'

		waybillTemplate += 'LINE 220 248 220  294 1\r\n'

		waybillTemplate += 'LINE 50 294 50  984 1\r\n'
		waybillTemplate += 'PRINT\r\n'
		return waybillTemplate
	},
	// 多联运单模板
	getMultiWaybillTemplate(wybillData, type) {
		var json = wybillData;

		console.log('json=====>', json)
		// 读取json中的值
		const getVal = (field) => {
			return field ? (json[field] || '') : ''
		}

		var waybillTemplate = ''
		waybillTemplate += '! 0 200 200 1200 1\r\n'
		waybillTemplate += 'PAGE-WIDTH 575\r\n'
		waybillTemplate += 'PREFEED 10\r\n'
		waybillTemplate += 'CENTER\r\n'
		waybillTemplate +=
			'EG 8 58 -235 20 0000000000000000000000000000000000000000000000000000003F00000000000000FFC0000000000001FFE0000000000003FFF0000000000007FFF800000000000FFFFC00000000001FFFFE00000000003FFFFF00000000007FFFFF8000000000FFFFFFC000000000FFF3FFC0000000007FE1FF80000000003FC0FF000000000C3F807F0C0000001C4F003C9E0000003F8600187F0000007F8000007F800000FFC00000FFC00001FFE00001FFE00003FFE00001FFF00007FFC00000FFF8000FFF8000007FFC000FFF0000003FFC001FFE0000001FFE001FFC0000000FFE001FF800000007FE001FF800000007FE001FFC0000000FFE001FFE0000001FFE000FFF0000003FFC000FFF8000007FFC0007FFC00000FFF80003FFE00001FFF00001FFE00001FFE00000FFC00000FFC000007F8000007F8000003F8600187F0000001E4F003C9E0000000C3F807F0C000000003FC0FF00000000007FE1FF8000000000FFF3FFC000000000FFFFFFC0000000007FFFFF80000000003FFFFF00000000001FFFFE00000000000FFFFC000000000007FFF8000000000003FFF0000000000001FFE0000000000000FFC00000000000003F00000000000000000000000000000000000000000000000000000000\r\n'
		waybillTemplate += 'SETBOLD 2\r\n'
		waybillTemplate += 'SETMAG 2 2\r\n'
		waybillTemplate += 'TEXT 3 0 0 10 德坤浩运\r\n'
		waybillTemplate += 'SETMAG 0 0\r\n'
		waybillTemplate += 'SETMAG 2\r\n'
		waybillTemplate += 'TEXT 7 0 0 60 DeKun LOGISTICS\r\n'
		waybillTemplate += 'SETMAG 0\r\n'
		waybillTemplate += 'SETBOLD 0\r\n'
		waybillTemplate += 'RIGHT\r\n'

		waybillTemplate += `TEXT 3 0 0 80 ${type}\r\n`
		waybillTemplate += `TEXT 55 0 470 145 第${ getVal('打印次数')}次打印\r\n`
		waybillTemplate += `TEXT 3 0 0 205 电话：${getVal("发货人电话")}\r\n`
		waybillTemplate += `TEXT 3 0 0 235 电话：${getVal("收货人电话")}\r\n`
		waybillTemplate += `TEXT 3 0 0 305 件数：${getVal("件数")}\r\n`
		waybillTemplate += `TEXT 3 0 0 335 回单：${getVal("回单")}\r\n`
		waybillTemplate += `TEXT 3 0 0 365 体积：${getVal("体积")}\r\n`
		waybillTemplate += `TEXT 3 0 0 435 合计应收：${getVal("合计应收")}\r\n`
		waybillTemplate += `TEXT 3 0 0 465 交货方式：${getVal("交货方式")}\r\n`
		if (type != "收货客户联") {
			waybillTemplate += 'TEXT 3 0 0 1020 扫一扫查单\r\n'
		} else {
			waybillTemplate += 'TEXT 3 0 0 1095 扫一扫查单\r\n'
		}

		waybillTemplate += 'LEFT\r\n'
		// waybillTemplate += `TEXT 3 0 0 110 ${getVal("开单网点简称")}--${getVal("路由二级地址")}/${getVal("路由目的地")}\r\n`
		// waybillTemplate += `TEXT 3 0 0 110 ${getVal("目的网点所属站点" || "")}--${getVal("路由目的地" || "")}\r\n`
		waybillTemplate += `TEXT 3 0 0 110 ${getVal("开单网点简称")}--${getVal("中转地")}/${getVal("路由目的地")}\r\n`
		waybillTemplate += `TEXT 3 0 0 140 运单号：${getVal("运单号")} \r\n`
		waybillTemplate += `TEXT 3 0 0 170 运单时间：${getVal("开单日期")}\r\n`
		waybillTemplate += `TEXT 3 0 0 205 发货人：${getVal("发货人")}\r\n`
		waybillTemplate += `TEXT 3 0 0 235 收货人：${getVal("收货人")}\r\n`
		waybillTemplate += `TEXT 3 0 0 265 地址：${getVal("收货地址")}\r\n`
		waybillTemplate += `TEXT 3 0 0 305 品名：${getVal("货名")}\r\n`
		waybillTemplate += `TEXT 3 0 0 335 包装：${getVal("包装")}\r\n`
		waybillTemplate += `TEXT 3 0 0 365 重量：${getVal("重量")}Kg\r\n`
		waybillTemplate += `TEXT 3 0 0 405 ${getVal("付款运费")}\r\n`
		waybillTemplate += `TEXT 3 0 0 435 代收：${getVal("代收")}\r\n`
		waybillTemplate += `TEXT 3 0 0 465 付款方式：${getVal("付款方式")}\r\n`
		waybillTemplate += `TEXT 3 0 0 500 备注：${getVal("备注")}\r\n`

		waybillTemplate += 'TEXT 55 0 10 535 托运人注意事项\r\n'
		waybillTemplate += 'TEXT 55 0 10 555 1.托运人不得托运易燃、易爆、易渗漏、有毒等危险货物，不得托运国家法律\r\n'
		waybillTemplate += 'TEXT 55 0 10 575 法规禁止运输的货物；托运人不接收和运输上述货物，若为隐报、错报，由此\r\n'
		waybillTemplate += 'TEXT 55 0 10 595 产生的全部责任、损失、人身伤害或财产损失均由托运人或第三方造成。\r\n'
		waybillTemplate += 'TEXT 55 0 10 615 2.托运人应如实告知托运货物的品名和性质，不得匿报或瞒报，因托运货物为\r\n'
		waybillTemplate += 'TEXT 55 0 10 635 危险品品发生爆燃、自爆等其他严重后果，均由托运人承担和赔偿。\r\n'
		waybillTemplate += 'TEXT 55 0 10 655 3.本运单所有内容均为承运人根据托运人申报的信息填写，托运人应当如实申\r\n'
		waybillTemplate += 'TEXT 55 0 10 675 报货物信息并在收到运单后查验无误，并承认对运单内容有异议的，应当立即\r\n'
		waybillTemplate += 'TEXT 55 0 10 695 提出；托运人对运单；托运人未提出异议的，视为确认本运单无误。\r\n'
		waybillTemplate += 'TEXT 55 0 10 715 4.托运人可以选择保价或者不保价运输。托运人选择不保价运输的，发生货损\r\n'
		waybillTemplate += 'TEXT 55 0 10 735 货差承运人最高按照运费三倍金额赔偿。托运人选择保价运输的，应当按照货\r\n'
		waybillTemplate += 'TEXT 55 0 10 755 物实际价值向承运人声明并支付声明价值费，托运人声明价值不得超过货物实\r\n'
		waybillTemplate += 'TEXT 55 0 10 775 际价值。声明价值的货物发生货损货差的，实际损失金额低于声明价值的，承\r\n'
		waybillTemplate += 'TEXT 55 0 10 795 运人按照实际损失金额赔偿；实际损失金额高于声明价值的，承运人按照声明\r\n'
		waybillTemplate += 'TEXT 55 0 10 815 价值赔偿。\r\n'
		waybillTemplate += 'TEXT 55 0 10 835 5.托运人同意确认，承运人可以将其托运的货物与其他货物进行集装后自行或\r\n'
		waybillTemplate += 'TEXT 55 0 10 855 者转委托第三方进行运输，托运人对此没有任何异议。\r\n'
		if (type != "收货客户联") {
			waybillTemplate += `TEXT 3 0 10 885 打印操作员：${getVal("打印操作员")}\r\n`
			waybillTemplate += 'TEXT 3 0 10 915 查货电话：400-999-2089\r\n'
			waybillTemplate += 'TEXT 3 0 10 945 客服电话：400-999-2089\r\n'
			if (type == "记账联" || type == "存根联") {
				waybillTemplate += 'TEXT 3 0 10 975 货款电话：0371-53397802\r\n'
			} else {
				waybillTemplate += `TEXT 3 0 10 975 发站电话：${getVal("发站电话")}\r\n`
				waybillTemplate += `TEXT 3 0 10 1005 到站电话：${getVal("到站电话")}\r\n`
				waybillTemplate += 'TEXT 3 0 10 1035 货款电话：0371-53397802\r\n'
			}
			waybillTemplate += 'VB QR 440 1015 M 4 U 4\r\n'
			waybillTemplate += `MA, http://tms.dekuncn.com:9011/#/home?customerCode==${getVal("运单号")} \r\n`
			waybillTemplate += 'ENDQR\r\n'
			waybillTemplate += 'LINE 0 875 820 875 2\r\n'
		} else {
			waybillTemplate += 'TEXT 55 0 10 875 6.收货客户联签名必须为发货人指定的收货人，如果收货人是自然人，需要出\r\n'
			waybillTemplate += 'TEXT 55 0 10 895 示身份证；如果收货人是公司，收货人需要出示授权委托书及身份证\r\n'
			waybillTemplate += 'TEXT 3 0 10 915 收货人签名：\r\n'
			waybillTemplate += 'LINE 0 945 820 945 2\r\n'
			waybillTemplate += `TEXT 3 0 10 955 打印操作员：${getVal("打印操作员")}\r\n`
			waybillTemplate += 'TEXT 3 0 10 985 查货电话：400-999-2089\r\n'
			waybillTemplate += 'TEXT 3 0 10 1015 客服电话：400-999-2089\r\n'
			waybillTemplate += `TEXT 3 0 10 1045 发站电话：${getVal("发站电话")}\r\n`
			waybillTemplate += `TEXT 3 0 10 1075 到站电话：${getVal("到站电话")}\r\n`
			waybillTemplate += 'TEXT 3 0 10 1105 货款电话：0371-53397802\r\n'
			waybillTemplate += 'VB QR 440 1085 M 4 U 4\r\n'
			waybillTemplate += `MA, http://tms.dekuncn.com:9011/#/home?customerCode=${getVal("运单号")} \r\n`
			waybillTemplate += 'ENDQR\r\n'
		}
		waybillTemplate += 'LINE 0 195 820 195 2\r\n'
		waybillTemplate += 'LINE 0 295 820 295 2\r\n'
		waybillTemplate += 'LINE 0 395 820 395 2\r\n'
		waybillTemplate += 'LINE 0 495 820 495 2\r\n'
		waybillTemplate += 'LINE 0 530 820 530 2\r\n'

		waybillTemplate += 'FORM\r\n'
		waybillTemplate += 'PRINT\r\n'

		console.log(JSON.parse(JSON.stringify(waybillTemplate)))
		return waybillTemplate
	},
	// 获取蓝牙列表
	// 1.初始化蓝牙设备 || 提醒用户打开蓝牙设备
	player() {
		var that = this;
		uni.openBluetoothAdapter({ //调用微信小程序api打开蓝牙适配器接口
			success: function(res) {
				console.log(res)
				uni.showToast({
					title: '初始化成功',
					icon: 'success',
					duration: 800
				})
				that.findBlue();
			},
			fail: function(res) { //如果手机上的蓝牙没有打开，可以提醒用户
				uni.showToast({
					title: '请打开蓝牙',
					type: 'error ',
					icon: 'none'
				});
			}
		})
	},
	// 2.搜索周边设备（此操作比较耗费系统资源，请在搜索并连接到设备后调用 uni.stopBluetoothDevicesDiscovery 方法停止搜索。）
	findBlue() {
		var that = this
		uni.startBluetoothDevicesDiscovery({
			allowDuplicatesKey: false,
			interval: 0,
			success: function(res) {
				uni.showLoading({
					title: '正在搜索设备'
				})
				that.getBlue()
			}
		})
	},
	// 3.获取搜索到的设备信息
	getBlue() {
		//uni.getBluetoothDevices获取在蓝牙模块生效期间所有已发现的蓝牙设备。包括已经和本机处于连接状态的设备
		uni.getBluetoothDevices({
			success: function(res) {
				uni.hideLoading();
				console.log('蓝牙列表', res)
				//将BluetoothList遍历给用户，当用户点击连接某个蓝牙时调用4.0
				return res.devices
			},
			fail: function() {
				console.log("搜索蓝牙设备失败")
			}
		})
	},
	// 4.当用户点击某个设备时将deviceId进行蓝牙连接
	connetBlue(deviceId) {
		// console.log(deviceId)
		var that = this;
		uni.createBLEConnection({
			// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
			deviceId: deviceId, //设备id
			success: function(res) {
				uni.showToast({
					title: '连接成功',
					icon: 'fails',
					duration: 800
				})
				console.log("连接蓝牙成功!-->11111")
				uni.stopBluetoothDevicesDiscovery({
					success: function(res) {
						console.log('连接蓝牙成功之后关闭蓝牙搜索');
					}
				})
				that.deviceId = deviceId;
				that.getServiceId() //5.0
			}
		})
	},
	// 5.连接上需要的蓝牙设备之后，获取这个蓝牙设备的服务uuid
	getServiceId() {
		var that = this
		uni.getBLEDeviceServices({
			// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
			deviceId: that.deviceId,
			success: function(res) {
				console.log(res)
				//需要什么服务就用对应的services 
				that.readyservices = res.services[0].uuid //因设备而议：该特征值只支持读
				that.services = res.services[1].uuid //因设备而议：该特征值支持write和notfy服务
				that.getCharacteId() //6.0
			}
		})
	},
	// 6.如果一个蓝牙设备需要进行数据的写入以及数据传输，就必须具有某些特征值，所以通过上面步骤获取的id可以查看当前蓝牙设备的特征值
	getCharacteId() {
		var that = this
		uni.getBLEDeviceCharacteristics({
			// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
			deviceId: that.deviceId,
			// 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
			serviceId: that.services,
			success: function(res) {
				console.log(res)
				for (var i = 0; i < res.characteristics.length; i++) { //2个值
					var model = res.characteristics[i]
					if (model.properties.write) {
						//model.uuid:用来写入的uuid值
						//this.sendMy()给设备写入
						that.sendMy(model.uuid)
					}
					if (model.properties.notify) {
						//model.uuid:用来notify的uuid值
						that.notifyUuid = model.uuid
					}
				}
			}
		})
	},
	// 监听蓝牙打印机连接状态
	onBLEConnectionStateChange() {
		// 该方法回调中可以用于处理连接意外断开等异常情况
		uni.onBLEConnectionStateChange(function(res) {
			console.log('打印机连接状态：', res.connected);
			BLEState = res.connected
		})
	},
	// 断开与低功耗蓝牙设备的连接
	closeBLEConnection(data) {
		console.log('蓝牙断开');
		uni.closeBLEConnection({
			deviceId: data.deviceId,
			success(res) {
				console.log(res)
			}
		})
	},
	// 打印
	async print(data, {
		copiesState,
		assignState,
		labelCopies,
		assignBqValueStartValue,
		assignBqValueEndValue,
		waybillCopies,
		waybillInfo,
		parameterO097,
		multiSelectList,
		parameterO098
	}) {
		let that = this
		// console.log('打印机信息', data);
		// console.log('打印标签', labelCopies);
		// console.log('打印运单', waybillCopies);
		// console.log('运单信息', waybillInfo);
		let copies = copiesState // 是否不指定
		let assign = assignState // 是否指定
		let assignBqValueStart = assignBqValueStartValue || 0 // 指定开始份数
		let assignBqValueEnd = assignBqValueEndValue || 0 // 指定结束份数
		let labelValue = labelCopies || 0 // 不指定标签份数
		let waybillValue = waybillCopies || 0 // 运单份数
		// 要打印的张数
		let amountOfSheets = 0
		// 从低几张开始
		let whichOne = 1
		// 不指定
		if (copies) {
			amountOfSheets = labelValue
			whichOne = 1
		}
		// 指定
		if (assign) {
			// 计算差值
			// 要打印的张数
			amountOfSheets = assignBqValueEnd
			// 从低几张开始
			whichOne = assignBqValueStart
		}
		let deviceId = data.deviceId;
		let serviceId = data.services[0].serviceId;
		let characteristicId = data.services[0].characteristicId;
		// 打印
		let WayBillInfoVO = waybillInfo.appletWayBillCodeInfoVO;
		// 获取标签模板
		// let lableData = {
		// 	code: WayBillInfoVO.code, // 运单号
		// 	quantity: WayBillInfoVO.quantity, // 件数
		// 	shipMan: WayBillInfoVO.shipMan, // 发货人
		// 	transitStationName: waybillInfo.transitStationName,// 目的
		// 	receivedCompany: WayBillInfoVO.receivedCompany, // 收货单位
		// 	packUnits: WayBillInfoVO.packUnits, // 包装
		// 	itemNames: WayBillInfoVO.itemNames, // 品名
		// 	volume: WayBillInfoVO.volume, // 计体
		// 	weight: WayBillInfoVO.weight, // 计重
		// 	handoverMode: WayBillInfoVO.handoverMode, // 收货方式
		// 	receivedMan: WayBillInfoVO.receivedMan, // 收货人
		// 	destinationPoint: waybillInfo.destinationPoint,   // 终端
		// 	startPoint: waybillInfo.startPoint, // 开单网点
		// 	time: WayBillInfoVO.orderDate, // 开单时间
		// }
		// 获取运单模板
		// let wybillData = {
		// 	companyname: WayBillInfoVO.companyName,  //到站
		// 	startStation: WayBillInfoVO.startStation,  //始发站
		// 	desitiantionSataion: WayBillInfoVO.desitiantionSataion,  // 到站
		// 	startPoint: WayBillInfoVO.startPoint,   // 开单网点
		// 	startPointPhone: WayBillInfoVO.startPointPhone, // 开单网点电话
		// 	destinationPoint: WayBillInfoVO.destinationPoint,  //目的网点
		// 	destinationPhone: WayBillInfoVO.destinationPhone,  //目的网点电话
		// 	takeAddress: WayBillInfoVO.takeAddress,   // 提货地址
		// 	transportMode: WayBillInfoVO.transportMode,  // 运输方式
		// 	code: WayBillInfoVO.code,  // 运单号
		// 	receivedMan: WayBillInfoVO.receivedMan, // 收货联系人
		// 	receivedManPhone: WayBillInfoVO.receivedManPhone, // 收货联系人手机
		// 	receivedAddress: WayBillInfoVO.receivedAddress, // 收货联系人收货地址
		// 	shipMan: WayBillInfoVO.shipMan, // 发货联系人
		// 	shipManPhone: WayBillInfoVO.shipManPhone, // 发货联系人手机
		// 	itemNames: WayBillInfoVO.itemNames, // 品名
		// 	packUnits: WayBillInfoVO.packUnits, // 包装
		// 	billingWeight: WayBillInfoVO.weight, // 计费重量
		// 	billingVolumn: WayBillInfoVO.volume, // 计费体积
		// 	quantity: WayBillInfoVO.quantity, // 件数
		// 	receivedTransferFee: WayBillInfoVO.receivedTransferFee, // 运费
		// 	collectionGoodsFee: WayBillInfoVO.collectionGoodsFee, // 代收贷款
		// 	collectionProceduresFee: WayBillInfoVO.collectionProceduresFee, // 手续费
		// 	otherFee: WayBillInfoVO.otherFee, // 其他费用
		// 	disCountFee: WayBillInfoVO.disCountFee, // 折扣折让
		// 	deliveryFee: WayBillInfoVO.deliveryFee, // 送货费
		// 	pickUpFee: WayBillInfoVO.pickUpFee, // 接货费
		// 	declareValue: WayBillInfoVO.declareValue, // 声明价值
		// 	guaranteedFee: WayBillInfoVO.guaranteedFee, // 保价费
		// 	receiptFee: WayBillInfoVO.receiptFee, // 回单费
		// 	loadingUnloadingFee: WayBillInfoVO.loadingUnloadingFee, // 装卸费
		// 	entryFee: WayBillInfoVO.entryFee, // 进仓费
		// 	upStairFee: WayBillInfoVO.upStairFee, // 上楼费
		// 	paymentMethod: WayBillInfoVO.paymentMethod, // 付款方式
		// 	totalShipFee: WayBillInfoVO.totalShipFee, // 总运费
		// 	handoverMode: WayBillInfoVO.handoverMode, // 交接方式
		// 	receiptRequirement: WayBillInfoVO.receiptRequirement, // 回单要求
		// 	receiptQty: WayBillInfoVO.receiptQty, // 回单份数
		// 	remarks: WayBillInfoVO.remarks,  // 备注 
		// 	orderDate: WayBillInfoVO.orderDate, // 开单时间
		// 	orderMan: WayBillInfoVO.orderMan, // 制单人
		// }
		// 修改蓝牙MTU值
		uni.setBLEMTU({
			deviceId: deviceId,
			mtu: 512
		})
		for (let i = whichOne; i <= Number(amountOfSheets); i++) {
			let data = {
				...WayBillInfoVO
			}
			data.currentCopyCode = i
			if (data.startPoint == '盛聚拼多多项目部') {
				data['QRCode'] = i < 10 ? data.code + '000' + i.toString() : i >= 10 ? data.code + '00' + i
					.toString() : data.code + '0' + i.toString()
			} else {
				data['QRCode'] = data.code
			}
			// 判断是浩运还是德坤标签
			var labelTemplate = parameterO098 == "1" ? that.getHYLabelTemplate(data) : that.getLabelTemplate(data)
			let buffer = gbk.strToGBKByte(labelTemplate);
			let osName = ''
			uni.getSystemInfo({
				success: function(res) {
					osName = res.osName
				}
			});
			if (osName == 'ios') {
				setTimeout(() => {
					uni.writeBLECharacteristicValue({
						// 这里的 deviceId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
						deviceId,
						// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
						serviceId,
						// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
						characteristicId,
						// 这里的value是ArrayBuffer类型
						value: buffer,
						success(res) {
							uni.hideNavigationBarLoading() //关闭加载动画
							console.log('writeBLECharacteristicValue success', res.errMsg)
							// that.startNotice({ deviceId: deviceId, serviceId: serviceId, characteristicId: characteristicId })
						}
					})
				}, 300)
			} else {
				var length = buffer.byteLength;
				var count = Math.ceil(length / 512); //最多执行 count 次
				for (let i = 0; i < count; i++) {
					//对buffer进行分包，最大不超过512字节
					let TempBuffer = "";
					if (((i + 1) * 512) < length) {
						TempBuffer = buffer.slice(i * 512, (i + 1) * 512);
						// console.log("正在进行第" + i + "次数据写入：" + TempBuffer);
						setTimeout(() => {
							//写入设备
							uni.writeBLECharacteristicValue({
								deviceId, //设备deviceId
								serviceId, //设备service_id
								characteristicId, //设备write特征值
								value: TempBuffer, //写入数据
								success: function(res) {
									console.log('writeBLECharacteristicValue success ->' + i,
										res)
								},
								fail: function(res) {
									console.log('writeBLECharacteristicValue fail', res)
								}
							})
						}, 300)
					} else {
						TempBuffer = buffer.slice(i * 512, length);
						// console.log("正在进行第" + i + "次数据写入：" + TempBuffer);
						setTimeout(() => {
							//写入设备
							uni.writeBLECharacteristicValue({
								deviceId, //设备deviceId
								serviceId, //设备service_id
								characteristicId, //设备write特征值
								value: TempBuffer, //写入数据
								success: function(res) {
									console.log('writeBLECharacteristicValue success ->' + i,
										res)
								},
								fail: function(res) {
									console.log('writeBLECharacteristicValue fail', res)
								}
							})
						}, 300)
					}
					this.sleep(i * 0.02); //延迟 i*200ms  
				}
			}
		}
		// var waybillTemplate = that.getWaybillTemplate(wybillData);
		var waybillTemplate = "";
		// 如果开启了多联打印
		let json = {
			deviceId: deviceId,
			serviceId: serviceId,
			characteristicId: characteristicId
		}
		if (parameterO097 == "1" && multiSelectList && multiSelectList?.length) {
			console.log("都选择了哪些表：", multiSelectList);
			// 使用for...of循环确保异步操作串行执行
			for (const item of multiSelectList) {
				try {
					// 调用后端接口获取表信息
					const paramValue = await that.getFaceOrderReport(WayBillInfoVO.code, item);
					console.log('返回值：', paramValue);
					// 2. 生成模板
					waybillTemplate = that.getMultiWaybillTemplate(paramValue, item);
					// 3. 打印运单（假设printWaybill是同步或已封装为Promise）
					that.printWaybill(waybillValue, waybillTemplate, json);
				} catch (error) {
					console.error('多联打印步骤出错:', error);
				}
			}
		} else {
			waybillTemplate = that.getWaybillTemplate(WayBillInfoVO);
			// 打印运单
			that.printWaybill(waybillValue, waybillTemplate, json);
		}
	},

	// 新的打印
	async newPrint(device, options, osName) {
		let that = this
		try {
			const {
				copiesState,
				assignState,
				labelCopies,
				assignBqValueStartValue,
				assignBqValueEndValue,
				waybillCopies,
				waybillInfo,
				parameterO097,
				multiSelectList,
				parameterO098
			} = options || {}

			let copies = copiesState // 是否不指定
			let assign = assignState // 是否指定
			let assignBqValueStart = assignBqValueStartValue || 0 // 指定开始份数
			let assignBqValueEnd = assignBqValueEndValue || 0 // 指定结束份数
			let labelValue = labelCopies || 0 // 不指定标签份数
			let waybillValue = waybillCopies || 0 // 运单份数
			let amountOfSheets = 0 // 要打印的张数
			let whichOne = 1 // 从低几张开始
			// 不指定
			if (copies) {
				amountOfSheets = labelValue
				whichOne = 1
			}
			// 指定标签
			if (assign) {
				// 计算差值
				amountOfSheets = assignBqValueEnd // 要打印的张数
				whichOne = assignBqValueStart // 从低几张开始
			}
			let deviceId = device.deviceId;
			let serviceId = device.services[0].serviceId;
			let characteristicId = device.services[0].characteristicId;

			const defaultWriteParams = {
				deviceId,
				serviceId,
				characteristicId,
			}

			console.log('defaultWriteParams123123123', defaultWriteParams)

			// 打印
			let WayBillInfoVO = waybillInfo?.appletWayBillCodeInfoVO || {}
			// 修改蓝牙MTU值
			uni.setBLEMTU({
				deviceId: deviceId,
				mtu: 512
			})
			for (let i = whichOne; i <= Number(amountOfSheets); i++) {
				let data = {
					...WayBillInfoVO
				}
				data.currentCopyCode = i
				if (data.startPoint == '盛聚拼多多项目部') {
					data['QRCode'] = i < 10 ? data.code + '000' + i.toString() : i >= 10 ? data.code + '00' + i
						.toString() : data.code + '0' + i.toString()
				} else {
					data['QRCode'] = data.code
				}
				// 判断是浩运还是德坤标签
				var labelTemplate = parameterO098 == "1" ? that.getHYLabelTemplate(data) : that.getLabelTemplate(
					data)
				let buffer = gbk.strToGBKByte(labelTemplate);


				const writePro = (options, time = 300) => {
					return new Promise((resolve, reject) => {
						const {
							buffer,
							deviceId,
							serviceId,
							characteristicId
						} = options || {}
						if (deviceId && serviceId && characteristicId) {
							setTimeout(() => {
								uni.writeBLECharacteristicValue({
									deviceId,
									serviceId,
									characteristicId,
									value: buffer, // 这里的value是ArrayBuffer类型
									success() {

										resolve(true)
									},
									fail(res) {
										reject(new Error(res?.errMsg || '数据写入蓝牙打印机失败'))
									}
								})
							}, time)
						} else {
							reject(new Error('参数缺失，数据写入蓝牙打印机失败'))
						}

					})
				}

				if (osName == 'ios') {
					await writePro({
						...defaultWriteParams,
						buffer
					}, 300)
				} else {
					var length = buffer.byteLength;
					var count = Math.ceil(length / 512); //最多执行 count 次
					for (let i = 0; i < count; i++) {
						//对buffer进行分包，最大不超过512字节
						let TempBuffer = "";
						if (((i + 1) * 512) < length) {
							TempBuffer = buffer.slice(i * 512, (i + 1) * 512);
							await writePro({
								...defaultWriteParams,
								buffer: TempBuffer
							}, 300)
						} else {
							TempBuffer = buffer.slice(i * 512, length);
							await writePro({
								...defaultWriteParams,
								buffer: TempBuffer
							}, 300)
						}
					}
				}
				this.sleep(i * 0.02); //延迟 i*200ms
			}

			var waybillTemplate = "";
			if (parameterO097 == "1" && multiSelectList && multiSelectList?.length) {
				for (const item of multiSelectList) {
					const paramValue = await that.getFaceOrderReport(WayBillInfoVO.code, item);
					waybillTemplate = that.getMultiWaybillTemplate(paramValue, item);
					that.printWaybill(waybillValue, waybillTemplate, defaultWriteParams);
				}
			} else {
				waybillTemplate = that.getWaybillTemplate(WayBillInfoVO);
				that.printWaybill(waybillValue, waybillTemplate, defaultWriteParams);
			}
			return true
		} catch (err) {
			const errMsg = err?.message || '蓝牙打印数据写入失败'
			console.log('errMsg=====>', errMsg)
			uni.showToast({
				title: errMsg,
				icon: 'none'
			})
		}
	},
	getFaceOrderReport(code, type) {
		return new Promise((resolve, reject) => {
			let params = {
				codes: code,
				printType: type
			}
			console.log('传值：', params)
			api.getFaceOrderReport(params, {
				success: ({
					code,
					data
				}) => {
					console.log("返回值", data)
					if (code == 200) {
						resolve(data.table1[0])
					}
				}
			})
		})
	},
	// 打印运单
	printWaybill(waybillValue, waybillTemplate, {
		deviceId,
		serviceId,
		characteristicId
	}) {
		for (let index = 1; index <= Number(waybillValue); index++) {
			console.log('我是运单模板', waybillTemplate)
			let buffer = gbk.strToGBKByte(waybillTemplate)
			let osName = ''
			uni.getSystemInfo({
				success: function(res) {
					osName = res.osName
				}
			});
			if (osName == 'ios') {
				setTimeout(() => {
					uni.writeBLECharacteristicValue({
						// 这里的 deviceId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
						deviceId,
						// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
						serviceId,
						// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
						characteristicId,
						// 这里的value是ArrayBuffer类型
						value: buffer,
						success(res) {
							uni.hideNavigationBarLoading() //关闭加载动画
							console.log('writeBLECharacteristicValue success', res.errMsg)
							console.log('苹果写入成功');
							// that.startNotice({ deviceId: deviceId, serviceId: serviceId, characteristicId: characteristicId })
						}
					})
				}, 300)
			} else {
				var length = buffer.byteLength;
				var count = Math.ceil(length / 512); //最多执行 count 次
				for (let i = 0; i < count; i++) {
					//对buffer进行分包，最大不超过512字节
					let TempBuffer = "";
					if (((i + 1) * 512) < length) {
						TempBuffer = buffer.slice(i * 512, (i + 1) * 512);
						// console.log("正在进行第" + i + "次数据写入：" + TempBuffer);
						setTimeout(() => {
							//写入设备
							uni.writeBLECharacteristicValue({
								deviceId, //设备deviceId
								serviceId, //设备service_id
								characteristicId, //设备write特征值
								value: TempBuffer, //写入数据
								success: function(res) {
									console.log('writeBLECharacteristicValue success ->' + i, res)
								},
								fail: function(res) {
									console.log('writeBLECharacteristicValue fail', res)
								}
							})
						}, 300)
					} else {
						TempBuffer = buffer.slice(i * 512, length);
						// console.log("正在进行第" + i + "次数据写入：" + TempBuffer);
						setTimeout(() => {
							//写入设备
							uni.writeBLECharacteristicValue({
								deviceId, //设备deviceId
								serviceId, //设备service_id
								characteristicId, //设备write特征值
								value: TempBuffer, //写入数据
								success: function(res) {
									console.log('writeBLECharacteristicValue success ->' + i, res)
								},
								fail: function(res) {
									console.log('writeBLECharacteristicValue fail', res)
								}
							})
						}, 300)
					}
					this.sleep(i * 0.02); //延迟 i*200ms  
				}
			}
		}
	},
	// 8.创建链接，发送指令启用notify 功能接收设备返回的数据
	startNotice({
		deviceId,
		services,
		notifyUuid
	}) {
		var that = this;
		uni.notifyBLECharacteristicValueChange({
			state: true, // 启用 notify 功能
			// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
			deviceId: deviceId,
			// 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
			serviceId: services,
			// 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
			characteristicId: notifyUuid, //第一步 开启监听 notityid  第二步发送指令 write
			success(res) {
				//接收蓝牙返回消息
				uni.onBLECharacteristicValueChange((sjRes) => {
					// 此时可以拿到蓝牙设备返回来的数据是一个ArrayBuffer类型数据，
					//所以需要通过一个方法转换成字符串
					var nonceId = that.ab2hex(sjRes.value) //10.0
					console.log(sjRes)
					console.log('194行' + nonceId)
				})
			},
			fail(err) {
				console.log(err)
			}
		})
	},
	// 9.将字符串转换成ArrayBufer
	string2buffer(str) {
		let val = ""
		if (!str) return;
		let length = str.length;
		let index = 0;
		let array = []
		while (index < length) {
			array.push(str.substring(index, index + 2));
			index = index + 2;
		}
		val = array.join(",");
		// 将16进制转化为ArrayBuffer
		return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function(h) {
			return parseInt(h, 16)
		})).buffer
	},
	// 10.将ArrayBuffer转换成字符串
	ab2hex(buffer) {
		const hexArr = Array.prototype.map.call(
			new Uint8Array(buffer),
			function(bit) {
				return ('00' + bit.toString(16)).slice(-2)
			}
		)
		return hexArr.join('')
	},
	// 信息提示
	showMsg(text, icon = 'none', duration = 2500) {
		uni.showToast({
			title: text,
			icon: icon,
			duration
		})
	},
	// 时间戳转时间(年月日时分)
	getTime_s(timestamp, type) {
		let date = new Date(parseInt(timestamp))
		// let date = new Date(parseInt(timestamp) * 1000)
		let Year = date.getFullYear()
		let Moth =
			date.getMonth() + 1 < 10 ?
			"0" + (date.getMonth() + 1) :
			date.getMonth() + 1
		let Day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
		let Hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
		let Minute =
			date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
		let Sechond =
			date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()
		let GMT = ''
		if (type == 'dateTime') {
			return GMT = Year +
				"-" +
				Moth +
				"-" +
				Day +
				" " +
				Hour +
				":" +
				Minute
			// +
			// ":" +
			// Sechond
		}
		if (type == 'date') {
			return GMT = Year +
				"-" +
				Moth +
				"-" +
				Day
		}
	},
	// 指定时间（今日前一天时间的中午12点）
	getYesterdayNoonTime() {
		const now = new Date(); // 当前时间
		const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1); // 前一天
		const noon = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 12, 0); // 前一天中午12点
		// 格式化日期时间
		function pad(num) {
			return num < 10 ? '0' + num : num;
		}
		const formattedTime =
			`${noon.getFullYear()}-${pad(noon.getMonth() + 1)}-${pad(noon.getDate())} ${pad(noon.getHours())}:${pad(noon.getMinutes())}`;
		return formattedTime;
	},
	// 指定时间（今日前几天时间）
	getAssignTime(day) {
		const now = new Date(); // 当前时间
		const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day); // 前一天
		// 格式化日期时间
		function pad(num) {
			return num < 10 ? '0' + num : num;
		}
		const formattedTime = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;
		return formattedTime;
	},
	//   今日时间
	// 默认年月日时分秒
	// YMD 年月日
	todayTime(type) {
		const now = new Date(); // 当前时间
		const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(),
			now.getSeconds());
		// 格式化日期时间
		function pad(num) {
			return num < 10 ? '0' + num : num;
		}
		switch (type) {
			case 'YMD':
				return `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

			case 'YMDHMS':
				return `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())} ${pad(yesterday.getHours())}:${pad(yesterday.getMinutes())}:${pad(yesterday.getSeconds())}`;

			default:
				return `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())} ${pad(yesterday.getHours())}:${pad(yesterday.getMinutes())}`;
		}
	},
	//   装卸任务/清单状态颜色
	colorDispose(data) {
		var color = "#055ff6";
		switch (data) {
			case "等待中":
				color = "#055ff6";
				break;
			case "待开始":
				color = "#06c2f4";
				break;
			case "装卸中":
				color = "#ff9300";
				break;
			case "已挂起":
				color = "#d81e06";
				break;
			case "任务完成":
				color = "#02d9c6";
				break;
			case "装卸完成":
				color = "#06ac51";
				break;
			default:
				break;
		}
		return color;
	},

	processNullFields(obj) {
		// 如果输入不是对象或为null，直接返回
		if (obj === null || typeof obj !== 'object') {
			return obj;
		}

		// 创建新对象存储处理结果，避免修改原对象
		const result = {};

		// 遍历对象所有属性
		for (const key in obj) {
			// 只处理自身属性（不包括原型链上的）
			if (obj.hasOwnProperty(key)) {
				const value = obj[key];
				// 如果值为null则替换为空字符串，否则保持原值
				result[key] = value === null ? "" : value;
			}
		}

		return result;
	}

};