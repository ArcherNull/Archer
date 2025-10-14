<template>
	<button v-bind="customizedAttrs">
		<slot></slot>
	</button>
</template>

<script setup>
	import {
		defineOptions,
		computed,
		useAttrs,
		defineEmits,
		defineProps,
		ref
	} from 'vue'

	defineOptions({
		name: 'DKButton',
		inheritAttrs: false,
	})

	const attrs = useAttrs()
	const buttonRef = ref();

	const customizedAttrs = computed(() => {
		const obj = {
			disabled: false,
			loading: false,
			plain: true,
		}
		const data = Object.assign(obj, attrs);
		return data;
	});

	defineExpose({
		element: buttonRef
	});
</script>