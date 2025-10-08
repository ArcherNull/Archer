<template>
	<view class="">
		<view class="navigator">
			<view class="navigator_item borderRed" v-for="(item,index) in navigatorList" :key="index"
				@click="jumpPage(item)">
				{{ item.name }}
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				navigatorList: [{
					name: '地图定位',
					url: '/pages/index/location/index'
				}, {
					name: '图片上传',
					url: '/pages/index/upload/index'
				}]
			}
		},
		methods: {
			jumpPage(item) {
				const {
					url
				} = item
				if (url) {
					uni.navigateTo({
						url
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.navigator {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;

		&_item {
			aspect-ratio: 1/1;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}
</style>