<template>
	<view v-if="visible" class="deviceMask deviceMask--elevated" @click="onMask" @touchmove.stop.prevent>
		<view class="devicePanel devicePanel--solid editorPanel" @click.stop>
			<view class="devicePanel-header">
				<view class="devicePanel-title">元素设置</view>
				<view class="devicePanel-close" @click="close">×</view>
			</view>
			<scroll-view class="editorBody" scroll-y>
				<ElementEditor :element="element" @change="onChange" />
			</scroll-view>
			<view class="devicePanel-footer">
				<button class="action-btn action-btn--lg action-btn--primary" @click="close">完成</button>
			</view>
		</view>
	</view>
</template>

<script>
	import ElementEditor from './ElementEditor.vue'

	export default {
		name: 'ElementEditorPopup',
		components: { ElementEditor },
		props: {
			visible: { type: Boolean, default: false },
			element: { type: Object, default: null },
		},
		methods: {
			onMask() {
				this.close()
			},
			close() {
				this.$emit('update:visible', false)
				this.$emit('close')
			},
			onChange(next) {
				this.$emit('change', next)
			},
		},
	}
</script>

<style lang="scss" scoped>
	@import '../../print/comm/common.scss';

	.editorPanel {
		max-height: 78vh;
		display: flex;
		flex-direction: column;
	}

	.editorBody {
		max-height: 58vh;
		padding: 0 8rpx 16rpx;
		box-sizing: border-box;
	}

	.devicePanel-footer {
		padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
	}
</style>
