<template>
	<view class="box">
		<image class="logo" src="/static/logo.png"></image>
		<text class="title">{{title}}</text>
		<view class="title">{{ themeStore.count }}</view>
		<view class="title_btnbox">
			<button @click="clickFun">点击</button>
			<button @click="resetFun">重置</button>
		</view>

		<view class="title_btnbox">
			<button @click="ajaxFun('1')">接口1</button>
			<button @click="ajaxFun('2')">接口2</button>
			<button @click="ajaxFun('3')">接口3</button>
			<button @click="ajaxFun('4')">接口4</button>
			<button @click="ajaxFun('5')">接口5</button>
			<button @click="ajaxFun('6')">接口6</button>
		</view>

		<view class="title_btnbox">
			<button @click="$utils.showMsg('template调用全局提示')">全局提示</button>
			<button @click="globalFun('1')">全局提示</button>
			<button @click="globalFun('2')">抛出错误</button>
		</view>

		<view class="title_btnbox">
			<button @click="jumpFun('1')">navigateTo进入分包界面</button>
			<button @click="jumpFun('2')">redirectTo进入我的</button>
			<button @click="jumpFun('3')">reLaunch进入掌上门店</button>
			<button @click="jumpFun('4')">switchTab进入掌上门店</button>
		</view>
	</view>
</template>

<script setup name="Index">
	import {
		ref,
		getCurrentInstance,
	} from 'vue'
	import { onLoad } from '@dcloudio/uni-app';
	import {
		useThemeStore
	} from '@/store/index.jsx'
	import {
		testApi1,
		testApi2,
		testApi3,
		testApi4,
		testApi5,
		testApi6,
	} from '@/api/test.js'
	import {
		chooseImage,
		showMsg
	} from '@/common/utils/index.js'
	import {
		cusJump
	} from '@/common/jump/index.js'

	const themeStore = useThemeStore()
	let title = ref("Hello world")
	const {
		proxy
	} = getCurrentInstance();

	const clickFun = () => {
		console.log('点击按钮')
		themeStore.changeThemeColor()
	}

	const resetFun = () => {
		console.log('重置按钮')
		themeStore.reset()
	}

	const ajaxFun = (type) => {
		switch (type) {
			case '1':
				testApi1({})
				break
			case '2':
				testApi2({})
				break
			case '3':
				testApi3({})
				break
			case '4':
				testApi4({})
				break
			case '5':
				uploadFun({})
				break
			case '6':
				testApi6({})
				break
		}
	}

	async function uploadFun() {
		try {
			const imgInfo = await chooseImage()
			const path = imgInfo?.tempFilePaths?.[0]
			if (path) {
				const task = testApi5({
					name: 'files',
					filePath: path,
					formData: {
						fileType: 'TRANS',
						num: 1
					}
				})

				const uploadResult = await task()
				console.log('uploadResult', uploadResult)
				//  取消上传/下载
				// task.abort() 

				// 监听上传/下载进度
				task.onProgressUpdate(e => console.log(e))
			} else {
				showMsg('获取图片本地路径失败')
			}
		} catch (err) {
			showMsg(err?.message || err || '上传失败')
		}
	}

	function globalFun(type) {
		switch (type) {
			case '1':
				proxy.$utils.showMsg('script中调用全局提示')
				break
			case '2':
				throw new Error('错误提示')
				break
		}
	}

	function jumpFun(type) {
		switch (type) {
			case '1':
				 cusJump.navigateTo({
					url: '/subPagesA/store/storeDetail/index',
					success: function(res) {
						console.log('跳转成功', res)
					},
					complete: function(res) {
						console.log('跳转完成', res)
					}
				})
				break
			case '2':
				cusJump.redirectTo({
					url: '/subPagesA/store/storeDetail/index'
				})
				break
			case '3':
				cusJump.reLaunch({
					url: '/pages/store/index'
				})
				break
			case '4':
				cusJump.switchTab({
					url: '/pages/store/index'
				})
				break
		}
	}
</script>

<style lang="scss" scoped>
	.logo {
		height: 100px;
		width: 100px;
		margin: 100px auto 25px auto;
	}

	.box {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.title {
		font-size: 18px;
		color: #8f8f94;
		text-align: center;

		&_btnbox {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-wrap: wrap;
			gap: 20rpx;
			margin-bottom: 20rpx;
		}
	}
</style>