/*
 * @Author: Null
 * @Date: 2022-08-23 15:09:28
 * @Description: 入口文件
 */
import { createApp } from 'vue'
import { Run } from './plugins/admin/index'
import App from './App.vue'

const app = createApp(App)

Run(app).then(() => app.mount('#app'))

