<template>
	<view class="labelBox">
		<view class="labelBox-left" @click="onCheck">
			<checkbox
				v-if="showCheck"
				color="#FF9407"
				style="transform: scale(0.7)"
				:checked="checked"
			/>
			<text class="labelBox-label">{{ label }}</text>
		</view>
		<view class="labelBox-right">
			<slot></slot>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'LabelBox',
		props: {
			label: { type: String, default: '' },
			checked: { type: Boolean, default: false },
			showCheck: { type: Boolean, default: false },
		},
		methods: {
			onCheck() {
				this.$emit('checked')
			},
		},
	}
</script>

<style lang="scss" scoped>
	.labelBox {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
		padding: 16rpx 0;

		&-left {
			display: flex;
			align-items: center;
			gap: 4rpx;
			flex-shrink: 0;
		}

		&-label {
			font-size: 28rpx;
			color: #333;
		}

		&-right {
			flex: 1;
			display: flex;
			justify-content: flex-end;
		}
	}
</style>
