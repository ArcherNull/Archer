<template>
	<view class="actionBar">
		<view class="actionBar-row">
			<button class="action-btn action-btn--ghost" size="mini" @click="$emit('preview')">
				模板预览
			</button>
			<button class="action-btn action-btn--ghost" size="mini" @click="$emit('command')">
				查看指令
			</button>
			<button
				class="action-btn action-btn--primary"
				size="mini"
				:loading="printing"
				:disabled="printing"
				@click="$emit('print')"
			>
				{{ printing ? '打印中...' : '测试打印' }}
			</button>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'ActionBar',
		props: {
			printing: {
				type: Boolean,
				default: false,
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../../print/comm/common.scss';

	.actionBar {
		position: sticky;
		bottom: 0;
		z-index: 20;
		padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
		background: rgba(250, 246, 240, 0.96);
		border-top: 1rpx solid $pr-border-color;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);

		&-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 12rpx;
		}
	}

	.action-btn {
		flex: 1;
		height: 72rpx;
		line-height: 72rpx;
		font-size: 26rpx;
		border-radius: 12rpx;
	}

	.action-btn--primary {
		box-shadow: 0 6rpx 16rpx rgba(249, 174, 61, 0.28);
	}
</style>
