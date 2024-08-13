<!--
 * @Author: junsong Chen
 * @Date: 2024-04-04 16:49:42
 * @Email: 779217162@qq.com
 * @LastEditors: junsong Chen
 * @LastEditTime: 2024-04-04 17:09:08
 * @Description: 
-->
<template>
    <div class="logo">
        <div class="logo-left">
            <img alt="logo" class="logo-left-img" src="@/assets/logo.png" />
        </div>
        <div class="logo-right">
            {{ systemName }}
        </div>
    </div>
</template>

<script>
import { SYSTEM_CHZN_NAME } from '@/setting'
export default {
    name: 'LogoComponent',
    data() {
        return {
            systemName: SYSTEM_CHZN_NAME
        }
    }
}
</script>

<style lang="less" scoped>
.logo {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;

    &-left {
        &-img {
            width: 46px;
            height: 46px;
        }
    }

    &-right {
        font-size: 26px;
        font-weight: bold;
    }
}
</style>