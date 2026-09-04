<template>
	<PrintItemBox title="设备信息" :isShowBottomLine="true">
		<view slot="right">
			<view class="btBox" v-if="moduleState !== 'notStarted'">
				<view
					:class="['btBox-start', moduleStateClass]"
					@click="emitRestart"
				>
					{{ moduleStateText }}
				</view>
				<view
					:class="['btBox-search', searchStateClass]"
					@click="emitResearch"
				>
					{{ searchStateText }}
				</view>
				<view v-if="moduleState === 'started'">
					已搜索{{ deviceList.length }}设备
				</view>
			</view>
			<view class="unactiveCss" v-else @click="emitOpenSearch">
				未启动
			</view>
		</view>

		<view class="ops">
			<button
				type="primary"
				class="action-btn action-btn--primary"
				size="mini"
				:loading="searching"
				@click="emitOpenSearch"
			>
				开启蓝牙并搜索
			</button>
			<button
				size="mini"
				class="action-btn action-btn--ghost"
				:loading="scanning"
				@click="emitScanJoin"
			>
				扫码加入设备
			</button>
		</view>

		<view class="cPBox">
			<view class="sectionHead">
				<view class="cPTitle">已连接蓝牙设备</view>
				<button
					size="mini"
					class="action-btn action-btn--muted action-btn--sm"
					:disabled="!connectedList.length"
					@click="emitDisconnectAll"
				>全部中断</button>
			</view>
			<view class="cPList" v-if="connectedList.length">
				<view class="cPList-item" v-for="(item, index) in connectedList" :key="item.deviceId || index">
					<view class="cPList-item__brand">
						<image
							v-if="getBrandInfo(item).image"
							class="brandImg"
							:src="getBrandInfo(item).image"
							mode="aspectFit"
						/>
						<view class="cPList-item__meta">
							<view class="cPList-item__name">{{ item.name || item.localName || '未命名设备' }}</view>
							<view class="cPList-item__brandName">
								{{ getBrandInfo(item).brandName }}
								<text v-if="getBrandInfo(item).model"> · {{ getBrandInfo(item).model }}</text>
							</view>
							<view class="cPList-item__deviceId">设备ID：{{ item.deviceId || '--' }}</view>
						</view>
					</view>
					<view class="cPList-item__actions">
						<button
							v-if="isUnrecognized(item)"
							size="mini"
							class="action-btn action-btn--info action-btn--sm"
							:data-source="'connected'"
							:data-index="index"
							@click="openBindBrand"
						>选品牌</button>
						<button
							size="mini"
							class="action-btn action-btn--muted action-btn--sm"
							:data-index="index"
							@click="emitDisconnect"
						>取消连接</button>
					</view>
				</view>
			</view>
			<view class="noMoreBox" v-else>暂无连接蓝牙设备</view>
		</view>

		<view class="listBox">
			<view class="sectionHead">
				<view class="cPTitle">已搜索蓝牙设备</view>
				<view class="sectionHead-ops">
					<button
						size="mini"
						class="action-btn action-btn--muted action-btn--sm"
						:disabled="!deviceList.length"
						@click="emitClearSearch"
					>清空</button>
					<button
						size="mini"
						:class="[
							'action-btn',
							'action-btn--sm',
							searching ? 'action-btn--danger' : 'action-btn--primary',
						]"
						@click="emitToggleSearch"
					>{{ searching ? '取消搜索' : '搜索' }}</button>
				</view>
			</view>
			<scroll-view class="listScroll" scroll-y>
				<view
					v-for="(item, index) in deviceList"
					:key="item.deviceId || index"
					:class="['pItem', index !== deviceList.length - 1 ? 'borderBtm' : '']"
				>
					<view class="pItem-left">
						<view class="pItem-brandRow">
							<image
								v-if="getBrandInfo(item).image"
								class="brandImg brandImg--sm"
								:src="getBrandInfo(item).image"
								mode="aspectFit"
							/>
							<view class="pItem-brandText">
								<view class="pItem-left__name">{{ item.name || item.localName || '未命名设备' }}</view>
								<view class="pItem-left__brand">
									{{ getBrandInfo(item).brandName || '未知品牌' }}
									<text v-if="getBrandInfo(item).model"> · {{ getBrandInfo(item).model }}</text>
								</view>
							</view>
						</view>
						<view class="pItem-left__id">信号：{{ item.RSSI || 0 }} dBm</view>
						<view class="pItem-left__deviceId">设备ID：{{ item.deviceId || '--' }}</view>
					</view>
					<view class="pItem-right">
						<button
							v-if="isUnrecognized(item)"
							size="mini"
							class="action-btn action-btn--info action-btn--sm"
							:data-source="'search'"
							:data-index="index"
							@click="openBindBrand"
						>选品牌</button>
						<button
							v-else
							:class="[
								'action-btn',
								'action-btn--sm',
								item.isConnect ? 'action-btn--muted' : 'action-btn--primary',
							]"
							size="mini"
							:loading="connectingId === item.deviceId"
							:data-index="index"
							@click="emitConnect"
						>
							{{ item.isConnect ? '已连接' : '连接' }}
						</button>
					</view>
				</view>
				<view v-if="!deviceList.length" class="noMoreBox">暂无搜索结果</view>
			</scroll-view>
		</view>

		<BindPrinterBrandPopup
			:visible="bindPopupVisible"
			:device="bindTargetDevice"
			@update:visible="onBindVisibleUpdate"
			@confirm="onBindBrandConfirm"
		/>
	</PrintItemBox>
</template>

<script>
	import PrintItemBox from './PrintItemBox.vue'
	import BindPrinterBrandPopup from './BindPrinterBrandPopup.vue'
	import {
		resolvePrinterBrandInfo,
		isUnrecognizedPrinterBrand,
		saveDeviceBrandBinding,
	} from '../ble/config.js'

	export default {
		name: 'DeviceInfo',
		components: {
			PrintItemBox,
			BindPrinterBrandPopup,
		},
		props: {
			moduleState: {
				type: String,
				default: 'notStarted',
			},
			searchState: {
				type: String,
				default: 'notSearched',
			},
			deviceList: {
				type: Array,
				default: function () {
					return []
				},
			},
			connectedList: {
				type: Array,
				default: function () {
					return []
				},
			},
			searching: {
				type: Boolean,
				default: false,
			},
			scanning: {
				type: Boolean,
				default: false,
			},
			connectingId: {
				type: String,
				default: '',
			},
		},
		data() {
			return {
				bindPopupVisible: false,
				bindTargetDevice: null,
				brandBindVersion: 0,
			}
		},
		computed: {
			moduleStateText() {
				if (this.moduleState === 'started') return '已启动'
				if (this.moduleState === 'starting') return '正在启动...'
				return '未启动'
			},
			searchStateText() {
				if (this.searchState === 'searched') return '已搜索'
				if (this.searchState === 'searching') return '正在搜索...'
				return '未搜索'
			},
			moduleStateClass() {
				if (this.moduleState === 'started') return 'activeCss'
				if (this.moduleState === 'starting') return 'activeingCss'
				return 'unactiveCss'
			},
			searchStateClass() {
				if (this.searchState === 'searched') return 'activeCss'
				if (this.searchState === 'searching') return 'activeingCss'
				return 'unactiveCss'
			},
		},
		methods: {
			getBrandInfo(item) {
				void this.brandBindVersion
				const name = (item && (item.name || item.localName)) || ''
				const deviceId = (item && item.deviceId) || ''
				return resolvePrinterBrandInfo(name, deviceId)
			},
			isUnrecognized(item) {
				return isUnrecognizedPrinterBrand(this.getBrandInfo(item))
			},
			openBindBrand(e) {
				const dataset = (e && e.currentTarget && e.currentTarget.dataset) ||
					(e && e.target && e.target.dataset) ||
					{}
				const index = Number(dataset.index)
				const source = dataset.source
				let item = null
				if (source === 'connected') {
					item = this.connectedList[index]
				} else {
					item = this.deviceList[index]
				}
				if (!item || !item.deviceId) {
					uni.showToast({
						title: '设备信息不完整',
						icon: 'none',
					})
					return
				}
				this.bindTargetDevice = item
				this.bindPopupVisible = true
			},
			onBindVisibleUpdate(val) {
				this.bindPopupVisible = !!val
				if (!val) {
					this.bindTargetDevice = null
				}
			},
			onBindBrandConfirm(payload) {
				const deviceId = payload && payload.deviceId
				const model = payload && payload.model
				const bound = saveDeviceBrandBinding(deviceId, model)
				if (!bound) {
					uni.showToast({
						title: '绑定失败',
						icon: 'none',
					})
					return
				}
				this.brandBindVersion += 1
				this.bindTargetDevice = null
				uni.showToast({
					title: '绑定成功',
					icon: 'success',
				})
				this.$emit('brand-bind', {
					deviceId: deviceId,
					device: payload.device,
					brandInfo: bound,
				})
			},
			emitOpenSearch() {
				this.$emit('open-search')
			},
			emitResearch() {
				this.$emit('research')
			},
			emitRestart() {
				this.$emit('restart')
			},
			emitScanJoin() {
				this.$emit('scan-join')
			},
			getEventIndex(e) {
				if (typeof e === 'number') return e
				const dataset = (e && e.currentTarget && e.currentTarget.dataset) ||
					(e && e.target && e.target.dataset) ||
					{}
				const index = Number(dataset.index)
				return isNaN(index) ? -1 : index
			},
			emitConnect(e) {
				const item = this.deviceList[this.getEventIndex(e)]
				if (!item || !item.deviceId) {
					uni.showToast({
						title: '设备信息不完整',
						icon: 'none',
					})
					return
				}
				this.$emit('device-connect', item)
			},
			emitDisconnect(e) {
				const item = this.connectedList[this.getEventIndex(e)]
				if (!item || !item.deviceId) {
					uni.showToast({
						title: '设备信息不完整',
						icon: 'none',
					})
					return
				}
				this.$emit('device-disconnect', item)
			},
			emitDisconnectAll() {
				this.$emit('disconnect-all')
			},
			emitToggleSearch() {
				this.$emit('toggle-search')
			},
			emitClearSearch() {
				this.$emit('clear-search')
			},
		},
	}
</script>

<style lang="scss" scoped>
	$theme: #f9ae3d;
	$theme-soft: rgba(249, 174, 61, 0.12);

	.btBox {
		display: flex;
		gap: 12rpx;
		flex-wrap: wrap;
		justify-content: flex-end;
		font-size: 24rpx;
	}

	.unactiveCss {
		color: #dd524d;
		font-weight: 600;
	}

	.activeingCss {
		color: #c4841a;
		font-weight: 600;
	}

	.activeCss {
		color: #3bb54a;
		font-weight: 600;
	}

	.ops {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		flex-wrap: wrap;
		gap: 16rpx;
		padding: 12rpx 0 20rpx;
	}

	.action-btn {
		margin: 0;
		padding: 0 28rpx;
		height: 64rpx;
		line-height: 64rpx;
		font-size: 26rpx;
		font-weight: 600;
		border-radius: 999rpx;
		border: none;
		box-sizing: border-box;
		text-align: center;

		&::after {
			border: none;
		}

		&[disabled] {
			opacity: 0.45;
		}

		&--sm {
			height: 52rpx;
			line-height: 52rpx;
			padding: 0 22rpx;
			font-size: 24rpx;
			min-width: 120rpx;
		}

		&--primary {
			color: #fff !important;
			background: $theme !important;
			box-shadow: 0 6rpx 16rpx rgba(249, 174, 61, 0.28);
		}

		&--ghost {
			color: #c4841a;
			background: $theme-soft;
		}

		&--muted {
			color: #666;
			background: #f3eee6;
		}

		&--info {
			color: #fff !important;
			background: #5b8def !important;
		}

		&--danger {
			color: #fff !important;
			background: #dd524d !important;
		}
	}

	.cPTitle {
		font-size: 28rpx;
		font-weight: 700;
		color: #2c2c2c;
		margin-bottom: 0;
	}

	.sectionHead {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12rpx;
		margin-bottom: 14rpx;

		&-ops {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: 12rpx;
			flex-shrink: 0;
		}
	}

	.cPBox {
		padding-top: 4rpx;
	}

	.cPList {
		display: flex;
		flex-direction: column;
		gap: 12rpx;

		&-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16rpx;
			padding: 16rpx 18rpx;
			border: 2rpx solid $theme;
			border-radius: 14rpx;
			background: $theme-soft;

			&__brand {
				flex: 1;
				display: flex;
				align-items: center;
				gap: 16rpx;
				min-width: 0;
			}

			&__meta {
				flex: 1;
				min-width: 0;
			}

			&__name {
				color: #2c2c2c;
				font-size: 28rpx;
				font-weight: 700;
			}

			&__brandName {
				margin-top: 4rpx;
				color: #c4841a;
				font-size: 24rpx;
			}

			&__deviceId {
				margin-top: 4rpx;
				color: #a89880;
				font-size: 22rpx;
				word-break: break-all;
			}

			&__actions {
				display: flex;
				flex-direction: column;
				align-items: stretch;
				gap: 10rpx;
				flex-shrink: 0;
			}
		}
	}

	.brandImg {
		width: 88rpx;
		height: 88rpx;
		flex-shrink: 0;
		border-radius: 12rpx;
		background: #fff;

		&--sm {
			width: 72rpx;
			height: 72rpx;
		}
	}

	.noMoreBox {
		min-height: 100rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #a89880;
		background: #fffaf3;
		border-radius: 12rpx;
		border: 1rpx dashed #eadfce;
	}

	.listBox {
		margin-top: 28rpx;
		padding-top: 20rpx;
		border-top: 1rpx dashed #f0e6d6;
	}

	.listScroll {
		max-height: 420rpx;
		border: 1rpx solid #efe6d8;
		border-radius: 14rpx;
		padding: 0 16rpx;
		box-sizing: border-box;
		background: #fffaf3;

		.noMoreBox {
			border: none;
			background: transparent;
		}
	}

	.pItem {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
		padding: 18rpx 0;

		&-brandRow {
			display: flex;
			align-items: center;
			gap: 12rpx;
		}

		&-brandText {
			flex: 1;
			min-width: 0;
		}

		&-left {
			flex: 1;
			min-width: 0;

			&__name {
				font-size: 28rpx;
				font-weight: 700;
				color: #2c2c2c;
			}

			&__brand {
				font-size: 24rpx;
				color: #c4841a;
				margin-top: 2rpx;
			}

			&__id {
				font-size: 24rpx;
				color: #a89880;
				margin-top: 6rpx;
			}

			&__deviceId {
				font-size: 22rpx;
				color: #b0a08c;
				margin-top: 2rpx;
				word-break: break-all;
			}
		}

		&-right {
			width: auto;
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			gap: 10rpx;
			flex-shrink: 0;
		}
	}

	.borderBtm {
		border-bottom: solid 2rpx #efe6d8;
		box-sizing: border-box;
	}
</style>
