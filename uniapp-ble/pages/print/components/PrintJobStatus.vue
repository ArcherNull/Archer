<template>
	<view v-if="jobList.length" class="jobStatusList">
		<view
			v-for="job in jobList"
			:key="job.printType"
			:class="['jobStatus', job.status === 'printing' ? 'jobStatus--active' : '']"
		>
			<view class="jobStatus-top">
				<view class="jobStatus-count">
					<text class="jobStatus-countNum">{{ job.finishedCount }}/{{ job.totalCount }}</text>
					<text class="jobStatus-countLabel">已完成/总张数</text>
				</view>
				<view :class="['jobStatus-state', 'jobStatus-state--' + job.statusKey]">
					{{ job.statusText }}
				</view>
			</view>

			<view class="jobStatus-chips">
				<text class="chip chip--accent">{{ job.printTypeText }}</text>
				<text class="chip chip--printer">{{ job.printerName || '未连接打印机' }}</text>
				<text class="chip">MTU {{ job.mtu }}</text>
				<text class="chip">预计 {{ job.estimatedSec }}s</text>
				<text class="chip">进度 {{ job.printProgress }}%</text>
				<text class="chip">传输 {{ job.transferProgress }}%</text>
				<text class="chip">耗时 {{ job.elapsedSec }}s</text>
			</view>

			<view class="jobStatus-progress" v-if="showProgressBar(job)">
				<view
					class="jobStatus-progressBar"
					:style="{ width: Math.min(100, job.printProgress) + '%' }"
				/>
			</view>
		</view>
	</view>
</template>

<script>
	const PRINT_TYPE_MAP = {
		label: '标签打印',
		waybill: '运单打印',
		receipt: '回单打印',
	}

	const STATUS_MAP = {
		idle: '待打印',
		pending: '等待中',
		printing: '进行中',
		success: '成功',
		fail: '失败',
		cancelled: '已取消',
	}

	export default {
		name: 'PrintJobStatus',
		props: {
			/** 按类型拆分的任务列表 */
			jobs: {
				type: Array,
				default: function () {
					return []
				},
			},
			printLoading: {
				type: Boolean,
				default: false,
			},
		},
		computed: {
			jobList() {
				const list = Array.isArray(this.jobs) ? this.jobs : []
				return list.map((item) => {
					const status = String((item && item.status) || 'idle')
					const statusKey = STATUS_MAP[status] ? status : 'idle'
					const printType = (item && item.printType) || ''
					return {
						printType: printType,
						printTypeText: PRINT_TYPE_MAP[printType] || '打印任务',
						printerName: (item && item.printerName) || '',
						finishedCount: Number((item && item.finishedCount) || 0),
						totalCount: Number((item && item.totalCount) || 0),
						estimatedSec: Number((item && item.estimatedSec) || 0),
						printProgress: Number((item && item.printProgress) || 0),
						transferProgress: Number((item && item.transferProgress) || 0),
						elapsedSec: Number((item && item.elapsedSec) || 0),
						mtu: Number((item && item.mtu) || 0),
						status: statusKey,
						statusKey: statusKey,
						statusText: STATUS_MAP[statusKey] || '待打印',
					}
				})
			},
		},
		methods: {
			showProgressBar(job) {
				if (!job) return false
				return this.printLoading ||
					job.statusKey === 'printing' ||
					job.statusKey === 'success' ||
					job.statusKey === 'fail' ||
					job.printProgress > 0 ||
					job.totalCount > 0
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../comm/common.scss';

	.jobStatusList {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		margin-bottom: 14rpx;
		max-height: 420rpx;
		overflow-y: auto;
	}

	.jobStatus {
		padding: 16rpx 18rpx;
		border-radius: 14rpx;
		background: $pr-page-bg;
		border: 1rpx solid $pr-border-light;

		&--active {
			border-color: $pr-theme;
			background: $pr-theme-soft;
		}

		&-top {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16rpx;
		}

		&-count {
			display: flex;
			align-items: baseline;
			gap: 10rpx;
			min-width: 0;
		}

		&-countNum {
			font-size: 32rpx;
			font-weight: 700;
			color: $pr-theme-text;
			line-height: 1.2;
		}

		&-countLabel {
			font-size: 20rpx;
			color: $pr-text-muted;
		}

		&-state {
			flex-shrink: 0;
			padding: 6rpx 16rpx;
			border-radius: 999rpx;
			font-size: 22rpx;
			font-weight: 700;
			background: #f3eee6;
			color: #666;

			&--pending {
				background: #f3eee6;
				color: #888;
			}

			&--printing {
				background: $pr-theme-soft-strong;
				color: $pr-theme-text;
			}

			&--success {
				background: rgba(52, 168, 83, 0.14);
				color: #1e7a3a;
			}

			&--fail {
				background: rgba(220, 53, 69, 0.12);
				color: #b42318;
			}

			&--cancelled {
				background: #f3eee6;
				color: #888;
			}
		}

		&-chips {
			display: flex;
			flex-wrap: wrap;
			gap: 8rpx;
			margin-top: 10rpx;
		}

		&-progress {
			margin-top: 12rpx;
			height: 10rpx;
			border-radius: 999rpx;
			background: #f0e6d6;
			overflow: hidden;
		}

		&-progressBar {
			height: 100%;
			border-radius: 999rpx;
			background: linear-gradient(90deg, $pr-theme, $pr-theme-dark);
			transition: width 0.25s ease;
		}
	}

	.chip {
		padding: 6rpx 12rpx;
		border-radius: 999rpx;
		background: #fff;
		color: #666;
		font-size: 20rpx;
		line-height: 1.4;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;

		&--accent {
			background: $pr-theme-soft-strong;
			color: $pr-theme-text;
			font-weight: 600;
		}

		&--printer {
			max-width: 280rpx;
			color: $pr-text-body;
			font-weight: 600;
		}
	}
</style>
