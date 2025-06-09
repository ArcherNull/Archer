<template>
	<view class="uploadBox">
		<p>请去注册百度AK</p>
		<p>打包H5，请使用IE/QQ浏览器无痕浏览，IP定位比谷歌快(谷歌可能不响应)</p>
		<p>如果是微信公众号，请使用微信jssdk</p>

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
				上传添加水印(单传)
			</view>
			<view class="upload_box">
				<u-upload :previewFullImage="true" :maxCount="maxCount" width="260rpx" height="198rpx" name="1"
					:maxSize="maxSize" :fileList="imageSrc1" @afterRead="upload" @delete="deletePic"
					@oversize="oversize">
				</u-upload>
			</view>
			<view class="upload_alert">
				支持JPG、PNG格式，限制单张文件大小10M内
			</view>
		</view>

		<view class="upload">
			<view :class="['upload_title',  isRequired ? 'requiredCss' : '']">
				上传添加水印并压缩(单传)
			</view>
			<view class="upload_box">
				<u-upload :previewFullImage="true" :maxCount="maxCount" width="260rpx" height="198rpx" name="5"
					:maxSize="maxSize" :fileList="imageSrc5" @afterRead="upload5" @delete="deletePic"
					@oversize="oversize">
				</u-upload>
			</view>
			<view class="upload_alert">
				支持JPG、PNG格式，限制单张文件大小10M内
			</view>
		</view>

		<view class="upload">
			<view :class="['upload_title',  isRequired ? 'requiredCss' : '']">
				上传添加水印(多传)
			</view>
			<view class="upload_box">
				<u-upload :previewFullImage="true" :maxCount="maxCount" width="260rpx" multiple height="198rpx" name="4"
					:maxSize="maxSize" :fileList="imageSrc4" @afterRead="upload4" @delete="deletePic"
					@oversize="oversize">
				</u-upload>
			</view>
			<view class="upload_alert">
				支持JPG、PNG格式，限制单张文件大小10M内
			</view>
		</view>


		<view class="upload">
			<view :class="['upload_title',  isRequired ? 'requiredCss' : '']">
				上传自动压缩图片
			</view>
			<view class="upload_box">
				<u-upload :previewFullImage="true" :maxCount="maxCount" width="260rpx" height="198rpx" name="2"
					:maxSize="maxSize" :fileList="imageSrc2" @afterRead="upload2" @delete="deletePic"
					@oversize="oversize">
				</u-upload>
			</view>
			<view class="upload_alert">
				支持JPG、PNG格式，限制单张文件大小10M内
			</view>
		</view>


		<view class="upload">
			<view :class="['upload_title',  isRequired ? 'requiredCss' : '']">
				上传自动剪裁图片
			</view>
			<view class="upload_box">
				<view class="clipBox">
					剪裁尺寸：
					<view class="inputBox">
						宽<input type="number" v-model="clipWidth" class="inputCss" />px
						<view class="inputBox_1">
							*
						</view>
						高<input type="number" v-model="clipHeight" class="inputCss" />px

						<view class="inputBox_2">剪裁区域：{{ clipPosition }}</view>
					</view>
				</view>


			</view>
			<view class="upload_box">
				<u-upload :previewFullImage="true" :maxCount="maxCount" width="260rpx" height="198rpx" name="3"
					:maxSize="maxSize" :fileList="imageSrc3" @afterRead="upload3" @delete="deletePic"
					@oversize="oversize">
				</u-upload>
			</view>
			<view class="upload_alert">
				支持JPG、PNG格式，限制单张文件大小10M内
			</view>
		</view>


		<!-- 给图片添加的标签 -->
		<canvas v-if="watermarkCanvasOption.width > 0 && watermarkCanvasOption.height > 0"
			:style="{ width: watermarkCanvasOption.width + 'px', height: watermarkCanvasOption.height + 'px' }"
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
		addWatermarkAndCompress,
		saveImageToPA,
		getCurrentDate,
		showModal,
		isNotEmptyArr,

		compressImg,
		getFileInfoFun,
		convertNumber,
		clipImg
	} from '@/utils/index.js'

	export default {
		data() {
			return {
				isRequired: true,
				// 10 M
				maxSize: 10 * 1024 * 1024,
				// 2张
				maxCount: 6,
				//图片下标
				imageName: '',

				// 水印图片数组（单传）
				imageSrc1: [],
				// 水印图片数组（多传）
				imageSrc4: [],
				// 水印并压缩图片数组（单传）
				imageSrc5: [],
				// 当前定位字符串
				locationAddrStr: '',

				// 压缩图片数组
				imageSrc2: [],

				// 剪裁图片
				imageSrc3: [],

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

				clipWidth: 1000,
				clipHeight: 1000,
				clipPosition: 'center', // topLeft  topRight  bottomLeft  bottomRight  center
			}
		},
		onLoad() {
			this.getCusLocation()
		},
		methods: {

			getWatermarkList() {
				const that = this
				const cTime = getCurrentDate()
				return [{
						fontSize: 30,
						color: '#333333',
						margin: 30,
						position: 'topLeft',
						text: ['穿上草鞋，飞一般的感觉', '飞一般的感觉', that.locationAddrStr],
					},
					{
						fontSize: 30,
						color: '#F5F5F5',
						margin: 30,
						position: 'topRight',
						text: [cTime, '还得是你呀，一键三联啊', '还得是你呀，一键三联啊', that.locationAddrStr],
					},
					{
						fontSize: 30,
						color: 'red', // '#333333',
						margin: 30,
						position: 'bottomLeft',
						text: [cTime, that.locationAddrStr],
					},
					{
						fontSize: 30,
						color: 'green', // '#333333',
						margin: 30,
						position: 'bottomRight',
						text: [cTime, '帅啊，兄弟', null, '帅啊，兄弟', '帅啊，兄弟', that.locationAddrStr],
					},
				]
			},

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
							console.log('getSetting123123123', res)
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
							that.location.latitude = latitude
							that.location.longitude = longitude
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

			// 新增图片（单传）
			upload(event) {
				console.log('event123123123', event)
				const that = this
				that.imageName = event.name;
				const tPath = event.file.url

				if (that.locationAddrStr) {

					uni.showLoading({
						title: '处理中...'
					})
					addWatermark({
							canvasId: 'watermarkCanvas',
							imagePath: tPath,
							watermarkList: that.getWatermarkList()
						}, that).then(res => {
							// u-upload组件用于展示
							this[`imageSrc${event.name}`].push({
								url: res
							});

							// 下载图片
							return saveImageToPA(res)
						})
						.catch(err => {
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

			// 新增图片（单传）
			upload5(event) {
				const that = this
				that.imageName = event.name;
				const file = event.file
				const tPath = file.url

				if (that.locationAddrStr) {
					uni.showLoading({
						title: '处理中...'
					})

					addWatermarkAndCompress({
							canvasId: 'watermarkCanvas',
							imagePath: tPath,
							watermarkList: that.getWatermarkList()
						}, that, true).then(res => {
							console.log('下载图片====>', res)

							// u-upload组件用于展示
							this[`imageSrc${event.name}`].push({
								url: res
							});

							// 下载图片
							return saveImageToPA(res)

						})
						.catch(err => {
							uni.hideLoading()
							showMsg(err || '上传图片失败')
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


			// 新增图片(多传)
			async upload4(event) {
				const that = this
				that.imageName = event.name;
				const imageList = event.file
				console.log('imageList', imageList)
				const tPath = event.file.url

				if (that.locationAddrStr) {
					uni.showLoading({
						title: '处理中...'
					})

					for (let i = 0; i < imageList.length; i++) {
						const item = imageList[i]
						const tPath = item.url

						if (tPath) {
							const res = await addWatermark({
								canvasId: 'watermarkCanvas',
								imagePath: tPath,
								watermarkList: that.getWatermarkList()
							}, that)

							if (res) {
								// u-upload组件用于展示
								this[`imageSrc${event.name}`].push({
									url: res
								});

								// 下载图片
								// saveImageToPA(res)
							}
						}
					}

					uni.hideLoading()
				} else {
					this[`imageSrc${event.name}`].push({
						url: tPath
					});
				}

			},

			//新增图片
			upload2(event) {
				const that = this
				const file = event.file
				that.imageName = event.name;
				const tPath = file.url
				const fileSize = file.size
				compressImg({
						canvasId: 'watermarkCanvas',
						imagePath: tPath,
						fileSize
					}, that)
					.then(res => {
						console.log('下载图片====>', res)
						// u-upload组件用于展示
						this[`imageSrc${event.name}`].push({
							url: res
						});
						// 下载图片
						return saveImageToPA(res)
					})
					.catch(err => {
						console.log('压缩图片失败', err)
						uni.hideLoading()
						showMsg(err || '压缩图片失败')
					})
					.finally(() => {
						uni.hideLoading()
					})
			},

			// 剪裁图片
			upload3(event) {
				const that = this
				that.imageName = event.name;
				const tPath = event.file.url
				return clipImg({
						canvasId: 'watermarkCanvas',
						imagePath: tPath,
						cWidth: convertNumber(that.clipWidth),
						cHeight: convertNumber(that.clipHeight),
						position: that.clipPosition,
					}, that)
					.then(res => {
						console.log('下载图片====>', res)
						// u-upload组件用于展示
						this[`imageSrc${event.name}`].push({
							url: res
						});
						// 下载图片
						return saveImageToPA(res)
					})
					.catch(err => {
						console.log('剪切图片失败', err)
						uni.hideLoading()
						showMsg(err || '剪切图片失败')
					})
					.finally(() => {
						uni.hideLoading()
					})
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
		margin-bottom: 30rpx;
		font-size: 28rpx;

		&_title {
			margin-bottom: 30rpx;
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
		padding: 30rpx 18rpx;
		box-sizing: border-box;
	}

	.clipBox {
		margin-bottom: 30rpx;
	}

	.inputBox {
		display: flex;
		align-items: center;
	}

	.inputBox {
		&_1 {
			font-size: 48rpx;
			height: 48rpx;
			color: #F9B03D;
			margin: 0 12rpx;
		}

		&_2 {
			margin-left: 30rpx;
		}
	}



	.inputCss {
		width: 100rpx;
		padding: 6rpx;
		margin: 0 6rpx;
		background-color: #e3e3e3;
		border-radius: 10rpx;
	}
</style>