<template>
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


		<view class="upload">
			<view :class="['upload_title',  isRequired ? 'requiredCss' : '']">
				货物上传
			</view>
			<view class="upload_box">
				<u-upload :previewFullImage="true" :maxCount="maxCount" width="260rpx" height="198rpx" name="1"
					:maxSize="maxSize" :fileList="imageSrc1" @afterRead="upload()" @delete="deletePic()"
					@oversize="oversize()">
				</u-upload>
			</view>
			<view class="upload_alert">
				支持JPG、PNG格式，限制单张文件大小10M内
			</view>
		</view>

		<!-- 给图片添加的标签 -->
		<canvas :style="{ width: watermarkCanvasOption.width + 'px', height: watermarkCanvasOption.height + 'px' }"
			canvas-id="watermarkCanvas" id="watermarkCanvas" style="position: absolute; top: -10000000rpx;" />
	</view>
</template>

<script>
	import {
		showMsg,
		getLocation,
		getSetting,
		getBaiduAPIAccessToken,
		getBaiduAddressInfoByLocation,
		addWatermark,
		saveImageToPA,
		getCurrentDate,
		showModal,
		isNotEmptyArr
	} from './index.js'

	export default {
		data() {
			return {
				isRequired: true,
				// 10 M
				maxSize: 10 * 1024 * 1024,
				// 2张
				maxCount: 2,
				//图片下标
				imageName: '',
				// 货物图片数组
				imageSrc1: [],
				// 当前定位字符串
				locationAddrStr: '',

				// 定位对象，
				location: {
					latitude: undefined,
					longitude: undefined,
				},
				watermarkCanvasOption: {
					width: 0,
					height: 0,
					canvasContext: null
				},
			}
		},
		onLoad() {
			this.getCusLocation()
		},
		methods: {
			reLocation() {
				const that = this
				const resetLocation = () => {
					that.locationAddrStr = ''
					that.getCusLocation()
				}
				if (this.locationAddrStr) {
					if (isNotEmptyArr(this.imageSrc1) || isNotEmptyArr(this.imageSrc2)) {
						uni.showModal({
							title: '温馨提示',
							content: '刷新定位，将会清空所有已上传的图片，请确认是否继续操作？',
							success(res) {
								console.log('res=====>', res)
								if (res.confirm) {
									that.imageSrc2 = []
									that.imageSrc1 = []
									resetLocation()
								}
							}
						})
					} else {
						resetLocation()
					}
				} else {
					resetLocation()
				}

			},

			// 获取当前位置
			getCusLocation() {
				const that = this
				if (!that.locationAddrStr) {
					uni.showLoading({
						title: '定位中...'
					})
					getSetting().then(res => {
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
					that.validateSFisPass()
				}
			},

			// 超出大小
			oversize(event) {
				console.log('超出大小13123', event)
				const fileSize = Math.ceil(event.file.size / 1024 / 1024)
				showMsg(`文件大小超出10M，当前为${fileSize}M`)
			},

			//新增图片
			upload(event) {
				const that = this
				that.imageName = event.name;
				const tPath = event.file.url

				if (that.locationAddrStr) {
					const cTime = getCurrentDate()
					uni.showLoading({
						title: '处理中...'
					})
					addWatermark({
							canvasId: 'watermarkCanvas',
							imagePath: tPath,
							watermarkList: [{
									fontSize: 32,
									color: 'red', // '#333333',
									margin: 32,
									position: 'topLeft',
									text: ['飞一般的感觉', '飞一般的感觉', that.locationAddrStr],
								},
								{
									fontSize: 32,
									color: 'red', // '#333333',
									margin: 32,
									position: 'topRight',
									text: [cTime, '还得是你呀，一键三联啊', '还得是你呀，一键三联啊', that.locationAddrStr],
								},
								{
									fontSize: 32,
									color: 'red', // '#333333',
									margin: 32,
									position: 'bottomLeft',
									text: [cTime, that.locationAddrStr],
								},
								{
									fontSize: 32,
									color: 'red', // '#333333',
									margin: 32,
									position: 'bottomRight',
									text: [cTime, '帅啊，兄弟', , '帅啊，兄弟', '帅啊，兄弟', that.locationAddrStr],
								},
							]
						}, that).then(res => {
							// 下载图片
							return saveImageToPA(res)

							// 
							// this[`imageSrc${event.name}`].push({
							// 	url: res
							// });
						})
						.catch(err => {
							console.log('err123123123', err)
							uni.hideLoading()
						})
						.finally(() => {
							uni.hideLoading()
						})
				} else {
					this[`imageSrc${event.name}`].push({
						url: tPath
					});
				}

			},

			//删除图片
			deletePic(event) {
				this[`imageSrc${event.name}`].splice(event.index, 1);
			},
		}
	}
</script>

<style lang="scss" scoped>
	.upload {
		margin-bottom: 32rpx;
		font-size: 28rpx;

		&_title {
			margin-bottom: 20rpx;
			color: #999;
		}

		&_box {
			margin-bottom: 12rpx;
		}

		&_alert {
			font-size: 24rpx;
			color: #F9B03D;
		}

		&_text {
			display: flex;
			align-items: center;
			gap: 12rpx;

			.location {
				width: 38rpx;
				height: 38rpx;
			}

			.reLocation {
				color: $uni-color-primary;
				word-break: keep-all;
			}
		}
	}

	.requiredCss {
		&::after {
			content: '*';
			color: red;
			margin-left: 6rpx;
		}
	}

	.messgeCss {
		margin-top: 10rpx;
	}

	.uploadBox {
		padding: 20rpx 32rpx;
		box-sizing: border-box;
	}
</style>