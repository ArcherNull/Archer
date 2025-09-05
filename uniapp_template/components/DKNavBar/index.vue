<template>
	<view class="DKNavBar flex-cenbet">
		<view class="DKNavBar_1">
			<view class="navBox flex-censta">
				<view class="navItem" v-for="(item,index) in navList" :key='index' @click="clickNav(item)">
					<view class="navItem_1">
						<view :class="['navItem_1_1' , navId == item.id?'choosed1':'unchoosed1']">{{ item.text }}</view>
						<view :class="['navItem_1_2' , navId == item.id?'choosed':'']"></view>
					</view>
				</view>
			</view>
		</view>
		<view class="DKNavBar_2">
			<slot name="right"></slot>
		</view>
	</view>
</template>

<script>
	import {
		defineEmits,
		defineProps,
	} from 'vue'
	
	import {  } from ''


	const emits = defineEmits(['selctedNavFun', 'isShowCheckedFun'])
	defineProps({
		// 选中的导航id
		navId: {
			type: Number,
			default: 0
		},
		// 导航列表
		navList: {
			type: Array,
			default () {
				return []
			}
		}
	})

	const clickNav = (ele) => {
		emits('selctedNavFun', ele)
	}
	
	const oprTextFun = () => {
		emits('isShowCheckedFun')
	}
</script>

<style lang="scss" scoped>
	.DKNavBar {
		padding: 20rpx 32rpx;
	}

	.navBox {
		.navItem {
			width: 160rpx;

			&_1 {
				position: relative;
				font-size: 26rpx;
				color: #999999;
				display: inline-block;

				&_2 {
					position: absolute;
					bottom: -10rpx;
					left: 50%;
					transform: translateX(-50%);
					height: 6rpx;
					width: 50rpx;
				}
			}
		}
	}

	.choosed1 {
		color: $primary-color;
	}

	.unchoosed1 {
		color: #999999;
	}

	.choosed {
		background-color: $primary-color;
	}

	.unchoosed {
		background-color: #FFFFFF;
	}
</style>