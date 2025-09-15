<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-04-11 14:42:50
 * @LastEditTime: 2023-04-11 15:11:39
 * @Description: 
-->
<template>
	<view class="DKPageContent" :style="themeStore.themeVariable">
		<view class="DKPageContent_content" :style="styleObj" v-if="loadingType === 'normal'">
			<slot></slot>
		
			<!-- 加载更多 -->
			<DKLoadMore v-if="showLoadMore"></DKLoadMore>

		</view>
		<view v-else class="DKPageContent_other">
			<!-- 加载中 -->
			<DKLoading v-if="loadingType === 'loading'"></DKLoading>
			<!-- 数据为空 -->
			<DKEmpty v-if="loadingType === 'empty'"></DKEmpty>
			<!-- 无网络 -->
			<DKNoNet v-if="loadingType === 'noNet'"></DKNoNet>
			<!-- 无权限 -->
			<DKNotFound v-if="loadingType === 'noAuth'"></DKNotFound>
		</view>
	</view>
</template>

<script setup>
	import {
		defineEmits,
		defineProps,
		computed,
		toRaw
	} from 'vue'
	import {
		useThemeStore
	} from '@/store/system'

	import DKLoadMore from '@/components/DKLoadMore/index.vue';
	import DKLoading from "./components/DKLoading.vue";
	import DKEmpty from "./components/DKEmpty.vue";
	import DKNoNet from "./components/DKNoNet.vue";
	import DKNotFound from "./components/DKNotFound.vue";

	const themeStore = useThemeStore()

	defineProps({
		// 加载状态；normal: 正常，
		// 加载状态； loading, 加载中；empty，数据为空；noNet，无网络；noAuth，无权限；
		loadingType: {
			type: String,
			default: "normal",
		},
		// 是否展示底部加载
		showLoadMore: {
			type: Boolean,
			default: false
		},
		// 样式
		styleObj: {
			type: Object,
			default () {
				return {}
			}
		}
	})
</script>

<style lang="scss" scoped>
	.DKPageContent {
		&_other {}
	}
</style>