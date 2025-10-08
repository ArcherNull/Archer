<template>
	<!-- 在途打卡弹窗 -->
	<view>

		<view class="uploadBox">
			<view class="upload">
				<view class="upload_title">
					当前位置
				</view>
				<view class="upload_text">
					<image class="location" src="/static/locaImg.png" mode="widthFix"></image>
					<view>
						{{ locationAddrStr || '未获取当前定位' }}
					</view>
					<view class="reLocation" @click="reLocation()"> 重新定位</view>
				</view>
			</view>

			<view class="mapBox">
				<view class="mapBox_1">
					<map id="map" :scale="center.scale" class="map" :latitude="center.latitude"
						:longitude="center.longitude" :polyline="polyline" :markers="markers" show-compass enable-rotate
						show-scale>
					</map>
				</view>
				<view class="mapBox_2">
					承运商：{{ supplierName || '---' }}
				</view>
				<view class="btnBox" v-if="btnList.length">
					<view class="btnItem" v-for="(item, index) in btnList" :key="index">
						<view class="btnIcon" @click="operation(item.name)"
							v-if="item.name==='导航' ? Boolean(endPoint) : true">
							<image class="btnIcon_icon" :src="item.icon"></image>
							<view class="btnIcon_text" :style="{ color: item.color }">
								{{ item.name }}
							</view>
						</view>
					</view>
				</view>
			</view>

		</view>
	</view>
</template>

<script>
	import {
		showMsg,
		showNextMsg,
		getLocation,
		getSetting,
		getBaiduAPIAccessToken,
		getBaiduAddressInfoByLocation,
		isNotEmptyArr,
		isNotEmptyObj,
		getBaiduAddressListByKeywords,
		openLocation
	} from '@/utils/index.js'
	export default {
		name: 'OnWaySignPop',
		data() {
			return {
				btnLoading: false,
				waybillInfo: {},
				center: {
					latitude: 23.287281,
					longitude: 113.365845,
					scale: 5
				},
				polyline: [],
				markers: [],

				// 当前定位字符串
				locationAddrStr: '',
				// 定位对象，
				location: {
					latitude: undefined,
					longitude: undefined,
				},

				btnList: [{
					icon: '/static/de_phone.png',
					color: '#82B523',
					name: '联系供应商'
				}, {
					icon: '/static/de_kefu_phone.png',
					color: '#FF5C57',
					name: '联系客服'
				}, {
					icon: '/static/de_navigation.png',
					color: '#1296db',
					name: '导航'
				}],
				startPoint: null,
				endPoint: null,

				// 承运商
				supplierName: '',
				// 对接客服电话
				userServicePhone: null,
				// 调度联系电话
				dispatcherPhone1: null,
			}
		},
		computed: {},
		onLoad() {
			this.initPage()
		},
		methods: {
			async initPage() {
				await this.getWaybillInfo()
				this.getCusLocation()
			},

			async initMap() {
				const {
					latitude,
					longitude
				} = this.location
				if (latitude && longitude && this.locationAddrStr) {
					// 地图中心点定位
					this.center.latitude = latitude
					this.center.longitude = longitude
					this.center.scale = 9

					uni.showLoading({
						title: '绘图中...'
					})


					const fenceList = []

					fenceList.push({
						lat: latitude,
						lon: longitude,
						address: this.locationAddrStr
					})


					const startAddressObj = await this.getAddressObj(this.waybillInfo, 'begin')
					const endAddressObj = await this.getAddressObj(this.waybillInfo, 'end')
					if (isNotEmptyObj(startAddressObj)) {
						fenceList.push(startAddressObj)
					}

					if (isNotEmptyObj(endAddressObj)) {
						fenceList.push(endAddressObj)
					}

					const newMarkers = []
					const {
						startPoint,
						endPoint,
						resetPoints
					} = this.getStartAndEndPoints(fenceList)

					if (startPoint) {
						this.startPoint = startPoint
						newMarkers.push(startPoint)
					}
					if (endPoint) {
						this.endPoint = endPoint
						newMarkers.push(endPoint)
					}

					if (isNotEmptyArr(resetPoints)) {
						newMarkers.push(...resetPoints)
					}

					this.markers = newMarkers

					uni.hideLoading()
				}

			},


			async getAddressObj(item, perfix) {
				const province = item[`${perfix}Province`] || ''
				const city = item[`${perfix}City`] || ''
				const area = item[`${perfix}Area`] || ''
				const address = item[`${perfix}Address`] || ''
				const street = item[`${perfix}Street`] || ''

				const nStr = address || street || ''
				const fAddr = [province, city, area, nStr?.replace(province, '')?.replace(city, '')?.replace(area, '')]
					.filter(
						Boolean)
					.join('')

				const result = await getBaiduAddressListByKeywords({
					province,
					city,
					area,
					address: nStr
				})

				if (isNotEmptyArr(result)) {
					const firstRow = result[0]
					return {
						lat: firstRow?.location?.lat,
						lon: firstRow?.location?.lng,
						address: fAddr,
						addressType: perfix === 'begin' ? 0 : 1
					}
				}
			},


			// 获取起点/终点/其余地址
			getStartAndEndPoints(fenceList) {
				let startPoint = null
				let endPoint = null
				let resetPoints = []
				if (Array.isArray(fenceList) && fenceList.length) {
					fenceList.forEach((ele, index) => {
						const markerObj = {
							id: index + 100,
							latitude: ele.lat,
							longitude: ele.lon,
							width: 28,
							height: 28,
							label: {
								content: ele.address,
								anchorX: -10,
								anchorY: -55,
								bgColor: '#fff',
								padding: 5,
								color: '#011B3B',
								borderRadius: 6,
								fontSize: 12,
							},
							iconPath: '/static/image/MapPin.png'
						}
						if (ele.addressType === 0) {
							markerObj.iconPath = '/static/image/send.png'
							markerObj.label.color = '#CD5C5C'
							startPoint = markerObj
							this.startAddr = ele.address
						} else if (ele.addressType === 1) {
							markerObj.iconPath = '/static/image/reach.png'
							markerObj.label.color = '#32CD32'
							endPoint = markerObj
							this.endAddr = ele.address
						} else {
							markerObj.label.color = '#1E90FF'
							resetPoints.push(markerObj)
						}
					})
				}
				return {
					startPoint,
					endPoint,
					resetPoints
				}
			},


			operation(type) {
				switch (type) {
					case '联系供应商':
						this.makePhoneCallFun(this.dispatcherPhone1)
						break;
					case '联系客服':
						this.makePhoneCallFun(this.userServicePhone)
						break;
					case '导航':
						this.navigatorFun()
						break;
				}
			},

			makePhoneCallFun(text) {
				if (text) {
					uni.makePhoneCall({
						phoneNumber: text
					})
				} else {
					uni.showToast({
						title: '未获取到拨打的电话，请联系管理员',
						icon: 'none',
						duration: 1000
					});
				}
			},

			// 当前位置导航到目的地
			navigatorFun() {
				if (this.endPoint) {
					const data = {
						longitude: this.endPoint.longitude,
						latitude: this.endPoint.latitude,
					}
					openLocation(data)
				} else {
					showMsg('未获取到目的地数据')
				}
			},

			reLocation() {

				const that = this
				that.locationAddrStr = ''
				that.location.latitude = undefined
				that.location.longitude = undefined
				that.getCusLocation()
			},
			// 获取当前位置
			getCusLocation() {
				const that = this
				const {
					latitude,
					longitude
				} = this.location
				if (!that.locationAddrStr && !(latitude && longitude)) {
					uni.showLoading({
						title: '定位中...'
					})
					getSetting()
						.then(res => {
							if (res) {
								return getLocation()
							} else {
								return Promise.reject('地理位置授权失败')
							}
						}).then(res => {
							console.log('获取当前位置', res)
							const {
								latitude,
								longitude
							} = res
							this.location.latitude = latitude
							this.location.longitude = longitude
							return getBaiduAddressInfoByLocation({
								latitude,
								longitude
							})
						})
						.then(res => {
							console.log('地址解析成功', res)
							const {
								addressComponent: addressInfo,
								formatted_address
							} = res
							if (addressInfo && formatted_address) {
								const province = addressInfo?.province
								const city = addressInfo?.city
								const district = addressInfo?.district

								const street =
									`${addressInfo?.town}${addressInfo?.street}${addressInfo?.street_number}`
								const locationAddr = [province, city, district, street]

								const locationAddrStr = locationAddr.filter(Boolean).join('')
								console.log('locationAddrStr', locationAddrStr)
								that.locationAddrStr = locationAddrStr
								that.initMap()
							} else {
								return Promise.reject('经纬度解析地址失败')
							}
						})
						.catch(err => {
							console.log('地址解析失败', err)
							uni.hideLoading()
							showMsg(err || '获取当前定位位置失败，无法添加图片定位水印')
						})
						.finally(() => {
							uni.hideLoading()
						})
				} else {
					that.initMap()
				}
			},

			validateSubmitData() {
				const errLog = []
				const {
					latitude,
					longitude
				} = this.location

				const {
					waybillId,
					departBatchNo
				} = this.waybillInfo


				if (!(latitude && longitude)) {
					errLog.push('地理位置定位经纬度不能为空')
				}

				s
				s
				if (!waybillId) {
					errLog.push('运单id不能为空')
				}

				if (!this.locationAddrStr) {
					errLog.push('未获取到当前位置信息')
				}

				return {
					errLog,
					submitData: {
						departurePositionLat: latitude,
						departurePositionLng: longitude,
						waybillId,
						departBatchNo,
						departureAddress: this.locationAddrStr
					}
				}
			},

			async getWaybillInfo() {
				uni.showLoading({
					title: '加载中...'
				})
				const that = this
				const waybillId = this.waybillInfo.waybillId


				const mockData = {
					"success": true,
					"code": 200,
					"msg": "操作成功",
					"data": {
						"waybillId": "1925516220312850433",
						"waybillNo": "SF3178743910043",
						"orderId": null,
						"orderNo": null,
						"thirdMiddleNo": null,
						"noteNo": null,
						"customerNo": null,
						"prodivisionId": null,
						"prodivisionName": null,
						"companyId": null,
						"beginProvince": "广东省",
						"beginCity": "东莞市",
						"beginArea": "茶山镇",
						"beginAddress": "广东省东莞市茶山镇",
						"endProvince": "陕西省",
						"endCity": "西安市",
						"endArea": "雁塔区",
						"endAddress": "陕西省西安市雁塔区",
						"supplierName": null,
						"dispatcherPhone": '18122064822',
						"dispatcherPhone1": '18122062562',
						"userServicePhone": "18122062422"
					}
				}
				const requestFun = () => {
					return new Promise((resolve) => {
						setTimeout(() => {
							resolve(mockData)
						}, 50)
					})
				}


				const res = await requestFun()

				if (res?.code === 200) {
					const resData = res?.data || {}
					this.waybillInfo = resData
					this.supplierName = resData.supplierName
					this.userServicePhone = resData.userServicePhone
					this.dispatcherPhone1 = that.waybillInfo.dispatcherPhone1
				} else {
					showMsg(res?.msg || '获取运单详情信息失败')
				}

			}
		}
	}
</script>

<style lang="scss" scoped>
	.uploadBox {
		height: 63vh;
		padding: 20rpx 32rpx;
		box-sizing: border-box;
		touch-action: none;
	}

	.btnBox {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx;

		.btnItem {
			height: 100%;
			flex: 1;
		}
	}

	.mapBox {
		&_2 {
			font-size: 28rpx;
			margin: 10rpx 0;
		}
	}

	.btnIcon {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
		align-items: center;
		justify-content: center;
		font-size: 26rpx;
		margin-top: 20rpx;

		&_icon {
			width: 48rpx;
			height: 48rpx;
		}

		&_text {}
	}

	.upload {
		margin-bottom: 32rpx;
		font-size: 28rpx;

		&_title {
			margin-bottom: 20rpx;
			color: #999;
			display: flex;
			gap: 16rpx;
		}

		&_text {
			display: flex;
			align-items: center;
			gap: 12rpx;

			.location {
				width: 38rpx;
			}

			.reLocation {
				color: #F6AD02;
				word-break: keep-all;
			}
		}
	}

	.map {
		width: 100%;
		height: 35vh;
		position: relative;
	}
</style>