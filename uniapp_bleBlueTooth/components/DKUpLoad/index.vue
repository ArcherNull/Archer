<template>
	<view class="DKUpLoad grid3">
		<view class="DKUpLoad_1" v-for="(item,index) in imgList" :key='index'>
			<image :src="item.img" mode="widthFix" @click="$commJs.previewImg(imgList , 'img')"></image>
			<!-- 删除图片 -->
			<view class="delete" @click.stop="operation(0 , item , index)">
				<image src="/static/images/close.png" mode="widthFix"></image>
			</view>
		</view>
		<view class="DKUpLoad_2 flex-colcencen" v-if="imgList.length != limitImgNum" @click="operation(1)">
			<view class="DKUpLoad_2_1">
				<image src="/static/images/upload.png" mode="widthFix"></image>
			</view>
			<view class="DKUpLoad_2_2">上传图片</view>
		</view>
	</view>
</template>

<script setup>
	import {
		defineEmits,
		defineProps,
	} from 'vue'
	import {
		testApi5,
	} from '@/api/test.js'
	import {
		chooseImage,
		showMsg
	} from '@/common/utils/index.js'

	const emits = defineEmits(['selctedNavFun', 'isShowCheckedFun'])
	defineProps({
		// 最大上传数量
		limitImgNum: {
			type: Number,
			default: 6
		},
		// 上传图片数组
		imgList: {
			type: Array,
			default () {
				return []
			}
		}
	})

	function operation(index, item, ind) {
		let data = {
			item,
			ind
		}
		console.log('选中该图片的操作单位为：', data)
		switch (index) {
			case 0:
				console.log('删除图片')
				emits('deleteImg', data)
				break;
			case 1:
				console.log('上传图片')
				this.DKUpLoadImg()
				break;
		}
	}

	// 上传图片
	async function DKUpLoadImg() {
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
	}
</script>

<style lang="scss" scoped>
	.DKUpLoad {
		&_1 {
			position: relative;

			image {
				width: 200rpx;
				height: 200rpx;
			}

			.delete {
				position: absolute;
				top: 4rpx;
				right: 4rpx;
				z-index: 10;

				image {
					width: 48rpx;
					height: 48rpx;
				}
			}
		}

		&_2 {
			width: 200rpx;
			height: 200rpx;
			background: #eeeeee;
			border-radius: 10rpx;

			&_1 {
				image {
					width: 62rpx;
					height: 62rpx;
				}
			}

			&_2 {
				margin-top: 8rpx;
				font-size: 24rpx;
				color: #999999;
			}
		}
	}

	.grid3 {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		column-gap: 20rpx;
		row-gap: 20rpx;
	}
</style>