import Dialog from "./Dialog.vue";
import { createApp } from "vue";

function showMsg(msg, clickHandler) {
    const div = document.createComment('div')
    document.body.appendChild(div)

    // 渲染一个MessageBox组件
    const app = createApp(Dialog, {
        msg,
        onClick() {
            console.log('click')
            clickHandler & clickHandler()
        }
    })
    app.mount(div)
}

export default showMsg