<template>
	<view class="numBox">
		<!-- 加 图片 -->
		<image v-if="modelValue > min" class="imgNumCss" src="/static/images/numCle.png" @click="operation('sub')">
		</image>
		<image v-else class="imgNumCss" src="/static/images/numCle1.png"></image>
		<input class="numBox_input" type="number" :value="modelValue" placeholder-style="color: #1E1E1E;"
			placeholder-class="input-css" @input="$emit('update:modelValue', $event.target.value)" />
		<!-- 减 图片 -->
		<image class="imgNumCss" src="/static/images/numAdd.png" @click="operation('add')"></image>
	</view>
</template>

<script setup name="NumberBox">
	import {
		ref,
	} from 'vue'

	const props = defineProps({
		modelValue: {
			type: Number,
			default: 0
		},
		min: {
			type: Number,
			default: 0
		}
	})
	const emit = defineEmits(['update:modelValue'])

	// 转换为数字
	function convertNumber(str) {
		const val = Number(str)
		return isNaN(val) ? 0 : val
	}

	function inputChange(ele) {
		const str = ele.target.value
		const val = convertNumber(str)
		emit('update:modelValue', val)
	}

	function operation(type) {
		const mVal = convertNumber(props.modelValue)
		switch (type) {
			case 'sub':
				emit('update:modelValue', mVal - 1)
				break;
			case 'add':
				emit('update:modelValue', mVal + 1)
				break;
		}
	}
</script>

<style lang="scss" scoped>
	.numBox {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 6rpx;
		user-select: none;

		&_input {
			text-align: center;
			width: 80rpx;
		}
	}

	.imgNumCss {
		width: 46rpx;
		height: 46rpx;
	}
</style>