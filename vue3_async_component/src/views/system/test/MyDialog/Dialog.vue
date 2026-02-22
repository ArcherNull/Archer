<template>
    <div class="box">
        <div class="dialog">
            <div class="dialog-title">
                标题
            </div>
            <div class="dialog-content">
                {{ msg }}
            </div>
            <div class="dialog-footer">
                <button type="primary" @click="emit('click')">确定</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
    msg: {
        type: String,
        default: '弹窗内容'
    }
})
const emit = defineEmits(['click'])
</script>

<style lang="scss" scoped>
.box {
    background-color: rgba(0, 0, 0, 0.35);
    position: fixed;
    z-index: 100;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    cursor: pointer;

    .dialog {
        width: 600px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
        border-radius: 10px;

        &-title,
        &-footer {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 50px;
        }

        &-title {
            font-size: 18px;
            line-height: 28px;
            font-weight: bold;
            border-bottom: solid 1px #e3e3e3;
        }

        &-content {
            font-size: 16px;
            padding: 16px;
            min-height: 100px;
        }
    }
}
</style>