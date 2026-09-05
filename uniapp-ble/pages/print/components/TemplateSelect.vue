<template>
	<PrintItemBox title="打印模板选择" :isShowBottomLine="true">
		<view slot="right">
			<view class="modeSwitch">
				<view
					:class="['modeSwitch-item', templateMode === 'common' ? 'modeSwitch-item--on' : '']"
					@click="setMode('common')"
				>通用</view>
				<view
					:class="['modeSwitch-item', templateMode === 'brand' ? 'modeSwitch-item--on' : '']"
					@click="setMode('brand')"
				>品牌</view>
			</view>
		</view>

		<view class="tplList">
			<view
				v-for="(item, index) in templateOptions"
				:key="item.key"
				:class="['tplItem', index === templateIndex ? 'tplItem--active' : '']"
				@click="selectIndex(index)"
			>
				<view class="tplItem-main">
					<view class="tplItem-name">{{ item.label }}</view>
					<view class="tplItem-key">{{ item.desc || item.key }}</view>
				</view>
				<view
					v-if="templateMode === 'common'"
					class="tplItem-preview"
					@click.stop="onPreview(item, index)"
				>预览</view>
			</view>
		</view>
	</PrintItemBox>
</template>

<script>
	import PrintItemBox from './PrintItemBox.vue'

	export default {
		name: 'TemplateSelect',
		components: {
			PrintItemBox,
		},
		props: {
			templateOptions: {
				type: Array,
				default: function () {
					return []
				},
			},
			templateIndex: {
				type: Number,
				default: 0,
			},
			/** common | brand */
			templateMode: {
				type: String,
				default: 'brand',
			},
		},
		methods: {
			setMode(mode) {
				if (mode === this.templateMode) return
				this.$emit('update:templateMode', mode)
				this.$emit('mode-change', mode)
			},
			selectIndex(index) {
				this.$emit('update:templateIndex', index)
				this.$emit('change', index)
			},
			onPreview(item, index) {
				this.$emit('preview', { item: item, index: index })
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../comm/common.scss';

	.modeSwitch {
		display: flex;
		align-items: center;
		padding: 4rpx;
		border-radius: 999rpx;
		background: $pr-theme-soft;

		&-item {
			min-width: 88rpx;
			padding: 8rpx 18rpx;
			border-radius: 999rpx;
			text-align: center;
			font-size: 24rpx;
			color: $pr-text-muted;
			font-weight: 600;

			&--on {
				background: $pr-theme;
				color: #fff;
			}
		}
	}

	.tplList {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		padding: 12rpx 0 4rpx;
	}

	.tplItem {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 20rpx 22rpx;
		border: 2rpx solid $pr-border-color;
		border-radius: 14rpx;
		background: $pr-surface-warm;
		transition: border-color 0.2s ease, background 0.2s ease;

		&--active {
			border-color: $pr-theme;
			background: $pr-theme-soft;
			box-shadow: 0 4rpx 12rpx rgba(249, 174, 61, 0.15);
		}

		&-main {
			flex: 1;
			min-width: 0;
		}

		&-name {
			font-size: 28rpx;
			color: $pr-text-main;
			font-weight: 700;
		}

		&-key {
			margin-top: 8rpx;
			font-size: 22rpx;
			color: $pr-text-muted;
		}

		&-preview {
			flex-shrink: 0;
			padding: 10rpx 22rpx;
			border-radius: 999rpx;
			background: #fff;
			border: 1rpx solid $pr-theme;
			color: $pr-theme-text;
			font-size: 24rpx;
			font-weight: 600;
		}
	}
</style>
