<template>
	<PrintItemBox title="打印模板选择" :isShowBottomLine="true">
		<template #right>
			<picker :range="templateOptions" range-key="label" :value="templateIndex" @change="onChange">
				<view class="tplSwitch">
					{{ currentTemplate.label }}
					<text class="tplSwitch-arrow">▼</text>
				</view>
			</picker>
		</template>

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

<script setup>
	import {
		computed
	} from 'vue'
	import PrintItemBox from './PrintItemBox.vue'

	const props = defineProps({
		templateOptions: {
			type: Array,
			default: () => []
		},
		templateIndex: {
			type: Number,
			default: 0
		}
	})

	const emits = defineEmits(['update:templateIndex', 'change'])

	const currentTemplate = computed(() => {
		return props.templateOptions[props.templateIndex] || props.templateOptions[0] || {
			label: '请选择模板',
			key: ''
		}
	})

	function selectIndex(index) {
		emits('update:templateIndex', index)
		emits('change', index)
	}

	function onChange(e) {
		const index = Number(e.detail.value)
		selectIndex(index)
	}
</script>

<style lang="scss" scoped>
	.tplSwitch {
		display: flex;
		align-items: center;
		gap: 6rpx;
		color: $uni-color-primary;
		font-size: 26rpx;

		&-arrow {
			font-size: 18rpx;
			transform: scale(0.85);
		}
	}

	.tplList {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		padding: 8rpx 0 12rpx;
	}

	.tplItem {
		padding: 18rpx 20rpx;
		border: 1rpx solid #e3e3e3;
		border-radius: 10rpx;
		background: #fafafa;

		&--active {
			border-color: $uni-color-primary;
			background: rgba(255, 148, 7, 0.08);
		}

		&-name {
			font-size: 28rpx;
			color: #333;
			font-weight: bold;
		}

		&-key {
			margin-top: 6rpx;
			font-size: 22rpx;
			color: #999;
		}
	}
</style>
