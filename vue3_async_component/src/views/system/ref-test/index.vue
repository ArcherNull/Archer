
<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
    setup() {
        const msg = ref('hello world')
        console.log('msg.value', msg.value)
        return {
            msg
        }
    }
})
</script>

<template>
    <!-- 会自动解包，不需要使用msg.value -->
    <div>{{ msg }}</div>
</template>