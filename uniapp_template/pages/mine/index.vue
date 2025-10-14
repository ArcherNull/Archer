<template>
	<DKPageContent :loadingType="loadingType">
		<template #content>
			
			<view style="height: 200rpx;">
				测试文字大小
			</view>
			
			<view class="text1">
				测试文字大小
			</view>

			<view class="title_btnbox">
				<button @click="operation('1')">小文字</button>
				<button @click="operation('2')">正常文字</button>
				<button @click="operation('3')">大文字</button>


				<button @click="operation('4')">红色</button>
				<button @click="operation('5')">绿色</button>
				<button @click="operation('6')">蓝色</button>
			</view>
		</template>
	</DKPageContent>
</template>

<script setup name="Mine">
	import {
		ref,
		getCurrentInstance,
	} from 'vue'
	import {
		useThemeStore
	} from '@/store/system'
	import DKPageContent from '@/components/DKPageContent/index.vue'

	const loadingType = ref('normal')
	const themeStore = useThemeStore()

	const operation = (type) => {

		let themeOptions = {
			fontSize: '14px',
			unit: 'rpx',
			themeCode: 'light',
			themeColor: '#F6AD02',
		}

		switch (type) {
			case '1':
				themeOptions.fontSize = '12px'
				break;
			case '2':
				themeOptions.fontSize = '16px'
				break;
			case '3':
				themeOptions.fontSize = '20px'
				break;
			case '4':
				themeOptions.themeColor = '#FF0000'
				break;
			case '5':
				themeOptions.themeColor = '#008000'
				break;
			case '6':
				themeOptions.themeColor = '#0000FF'
				break;
		}

		themeStore.setTheme(themeOptions)
	}
</script>

<style lang="scss" scoped>
	.text2 {}
	
	.title_btnbox {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 20rpx;
		margin-bottom: 20rpx;
	}
</style>