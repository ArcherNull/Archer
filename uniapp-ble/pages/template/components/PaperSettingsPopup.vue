<template>
	<view v-if="visible" class="deviceMask deviceMask--elevated" @click="onMask" @touchmove.stop.prevent>
		<view class="devicePanel devicePanel--solid paperPanel" @click.stop>
			<view class="devicePanel-header">
				<view class="devicePanel-title">纸张设置</view>
				<view class="devicePanel-close" @click="close">×</view>
			</view>
			<scroll-view class="paperBody" scroll-y>
				<PaperSettings :paper="paper" @change="onChange" />
			</scroll-view>
			<view class="devicePanel-footer">
				<button class="action-btn action-btn--lg action-btn--primary" @click="close">完成</button>
			</view>
		</view>
	</view>
</template>

<script>
	import PaperSettings from './PaperSettings.vue'

	export default {
		name: 'PaperSettingsPopup',
		components: { PaperSettings },
		props: {
			visible: { type: Boolean, default: false },
			paper: { type: Object, required: true },
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

	.paperPanel {
		max-height: 78vh;
		display: flex;
		flex-direction: column;
	}

	.paperBody {
		max-height: 58vh;
		padding: 0 8rpx 16rpx;
		box-sizing: border-box;
	}

	.devicePanel-footer {
		padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
	}
</style>
