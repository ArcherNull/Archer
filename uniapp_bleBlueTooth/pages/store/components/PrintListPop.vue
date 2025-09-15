<template>
	<view>
		<view class="ppopBox" @click="operation('1')" v-if="openPop">
			<!-- 内容 -->
			<view class="ppop" @click.stop="">
				<!-- 弹窗标题 -->
				<view class="ppop-title">
					<view class="ppop-title__text">
						打印机列表
					</view>

					<view class="ppop-title__research" @click="reSearchNearByBlueToothFun()">
						重新搜索
					</view>
				</view>

				<view class="ppop-content">
					<scroll-view class="ppop-content__scroll" scroll-y v-if="printerList.length">
						<view :class="['pItem', index !== printerList.length - 1 ? 'borderBtm' : '']"
							v-for="(item, index) in printerList" :key="index">
							<view class="pItem-left">
								<view class="pItem-left__name">
									{{ item.name }}
								</view>
								<view class="pItem-left__id">
									UUID：{{ item.deviceId }}
								</view>
								<view class="pItem-left__id">
									信号强度：{{ item.RSSI || 0 }}dBm
								</view>
								<view class="pItem-left__id" v-if="item.printType">
									绑定：{{ item.printType === 'label' ? '打印标签' : '打印运单' }}
								</view>
							</view>
							<view class='pItem-right' v-if="type">
								<button :class="['pBtn', item.isConnect ? 'pBtn__unactive' : 'pBtn__active' ]"
									@click="connectPrinter(item)" :loading="printLoading">
									{{ item.isConnect ? '取消连接' : '连接' }}
								</button>
							</view>
						</view>
					</scroll-view>
					<view v-else class="noData">
						暂无数据 {{ cusBModuleInstance._bluetoothModuleState }}
					</view>
				</view>

				<view class="ppop-btn">
					<view class="btn">
						<button type="default" @click="operation('1')">关闭</button>
					</view>
					<view class="btn" v-if="cusBModuleInstance._bluetoothModuleState === 'started' && searchLoading">
						<button type="default" @click="operation('2')">取消搜索</button>
					</view>
					<view class="btn" v-if="cusBModuleInstance._bluetoothModuleState === 'started'">
						<button type="primary" class="primary-btn" @click="operation('3')"
							:loading="searchLoading">{{ searchLoading ?'搜索中...':'继续搜索' }}</button>
					</view>
				</view>
			</view>
		</view>
	</view>

</template>

<script setup name="PrintListPop">
	import {
		ref,
		getCurrentInstance,
		computed,
	} from 'vue'
	import {
		showMsg,
	} from '../comm/cusBluetooth.js'

	const props = defineProps({
		openPop: {
			type: Boolean,
			default: false
		},
		type: {
			type: String,
			default: ''
		}
	})
	const emits = defineEmits(['connect', 'closePop'])
	const searchLoading = ref(false)
	const stopSearchLoading = ref(false)
	const cusBModuleInstance = ref(null)

	const printerList = computed(() => {
		const pList = cusBModuleInstance.value?._searchDevicesResultList || []
		return pList
	})

	// 连接打印机
	function connectPrinter(item) {
		emits('connect', {
			item,
			type: props.type
		})
	}

	function operation(type) {
		switch (type) {
			case "1":
				console.log('关闭打印机列表')
				emits('closePop')
				break;
			case "2":
				console.log('取消搜索')
				asyncstopSearch()
				break;
			case "3":
				console.log('继续搜索')
				findBTDevices()
				break;
		}
	}

	// 停止搜索
	async function asyncstopSearch() {
		try {
			stopSearchLoading.value = true
			await cusBModuleInstance.value?.stopBluetoothDevicesDiscovery()
			stopSearchLoading.value = false
			searchLoading.value = false
		} catch (err) {
			stopSearchLoading.value = false
			showMsg(err?.message || '停止继续搜索蓝牙打印机失败')
		} finally {
			stopSearchLoading.value = false
		}
	}

	// 继续搜索
	async function findBTDevices() {
		try {
			searchLoading.value = true
			await cusBModuleInstance.value?.searchNearByBlueTooth('finding', 'continue')
			searchLoading.value = false
		} catch (err) {
			searchLoading.value = false
			showMsg(err?.message || '继续搜索蓝牙打印机失败')
		} finally {
			searchLoading.value = false
		}
	}

	// 重新搜索
	async function reSearchNearByBlueToothFun() {
		try {
			searchLoading.value = true
			await cusBModuleInstance.value?.reSearchNearByBlueTooth()
			searchLoading.value = false
		} catch (err) {
			searchLoading.value = false
			showMsg(err?.message || '继续搜索蓝牙打印机失败')
		} finally {
			searchLoading.value = false
		}
	}

	defineExpose({
		cusBModuleInstance
	})
</script>

<style lang="scss" scoped>
	.ppopBox {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 110;
		background-color: rgba(0, 0, 0, 0.25);
	}

	.ppop {
		position: absolute;
		background-color: #fff;
		bottom: 0;
		left: 0;
		right: 0;
		border-radius: 16rpx 16rpx 0 0;

		&-title {
			height: 90rpx;
			position: relative;
			border-bottom: solid 1rpx #e3e3e3;

			&__text {
				height: 90rpx;
				font-weight: bold;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 32rpx;
			}

			&__research {
				font-size: 28rpx;
				color: $uni-color-primary;
				position: absolute;
				right: 30rpx;
				top: 30rpx;
				z-index: 10;
			}
		}

		&-content {
			&__scroll {
				height: 50vh;
				padding: 0 20rpx 100rpx 20rpx;

			}

			height: 50vh;
		}

		&-btn {
			padding: 20rpx;
			box-sizing: border-box;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 20rpx;

			.btn {
				flex: 1;
			}
		}
	}

	.pItem {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
		padding: 16rpx 0;

		&-left {
			flex: 1;

			&__name {
				font-size: 30rpx;
				font-weight: bold;
				color: #333;
			}

			&__id {
				font-size: 26rpx;
				color: #999;
			}
		}

		&-right {
			width: 240rpx;
		}
	}

	.pBtn {
		height: 48rpx;
		padding: 0rpx 20rpx;
		border-radius: 24rpx;
		color: #fff;
		font-size: 26rpx;
		width: 160rpx;
		line-height: 48rpx;
		text-align: center;

		&__unactive {
			background-color: #999
		}

		&__active {
			background-color: $uni-color-primary;
		}
	}

	.borderBtm {
		border-bottom: solid 2rpx #e3e3e3;
		box-sizing: border-box;
	}

	.noData {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #999;
		height: 160rpx;
	}
</style>