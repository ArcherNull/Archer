<template>
	<PrintItemBox title="打印模板选择" :isShowBottomLine="true">
		<view slot="right">
			<picker :range="templateOptions" range-key="label" :value="templateIndex" @change="onChange">
				<view class="tplSwitch">
					{{ currentTemplate.label }}
					<text class="tplSwitch-arrow">▼</text>
				</view>
			</picker>
		</view>

		<view class="tplList">
			<view
				v-for="(item, index) in templateOptions"
				:key="item.key"
				:class="['tplItem', index === templateIndex ? 'tplItem--active' : '']"
				@click="selectIndex(index)"
			>
				<view class="tplItem-name">{{ item.label }}</view>
				<view class="tplItem-key">{{ item.key }}</view>
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
		},
		computed: {
			currentTemplate() {
				return this.templateOptions[this.templateIndex] || this.templateOptions[0] || {
					label: '请选择模板',
					key: '',
				}
			},
		},
		methods: {
			selectIndex(index) {
				this.$emit('update:templateIndex', index)
				this.$emit('change', index)
			},
			onChange(e) {
				const index = Number(e.detail.value)
				this.selectIndex(index)
			},
		},
	}
</script>

<style lang="scss" scoped>
	$theme: #f9ae3d;
	$theme-soft: rgba(249, 174, 61, 0.12);

	.tplSwitch {
		display: flex;
		align-items: center;
		gap: 8rpx;
		max-width: 360rpx;
		padding: 8rpx 16rpx;
		border-radius: 999rpx;
		background: $theme-soft;
		color: #c4841a;
		font-size: 24rpx;

		&-arrow {
			font-size: 16rpx;
			opacity: 0.7;
		}
	}

	.tplList {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		padding: 12rpx 0 4rpx;
	}

	.tplItem {
		padding: 20rpx 22rpx;
		border: 2rpx solid #efe6d8;
		border-radius: 14rpx;
		background: #fffaf3;
		transition: border-color 0.2s ease, background 0.2s ease;

		&--active {
			border-color: $theme;
			background: $theme-soft;
			box-shadow: 0 4rpx 12rpx rgba(249, 174, 61, 0.15);
		}

		&-name {
			font-size: 28rpx;
			color: #2c2c2c;
			font-weight: 700;
		}

		&-key {
			margin-top: 8rpx;
			font-size: 22rpx;
			color: #a89880;
		}
	}
</style>
