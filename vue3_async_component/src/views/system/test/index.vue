<!--
 * @Author: junsong Chen
 * @Date: 2025-12-15 23:31:44
 * @Email: 779217162@qq.com
 * @LastEditors: junsong Chen
 * @LastEditTime: 2025-12-19 00:24:08
 * @Description: 
-->
<template>
    <div>
        <!-- <Dialog></Dialog> -->
        <el-button type="primary" @click="clickFun()">点击</el-button>
    </div>
</template>

<script setup>
import showMsg from './MyDialog';
import Dialog from './MyDialog/Dialog.vue';

function clickFun() {
    showMsg('问题问题123123', () => {
        console.log('点击了确定按钮')
    })
}
</script>

<style lang="scss"></style>