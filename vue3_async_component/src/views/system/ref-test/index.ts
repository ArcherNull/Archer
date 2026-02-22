/**
 * 假设我是阿里的员工，我需要通过一个类同时去切换登录钉钉，H5，支付宝，阿里云，企业微信等
 */

function login(phone: string) {
    return `${phone} 登录成功`

}

/**
 * 抽象类定义
 */
abstract class BaseLogin {
    abstract getUserInfo(): Promise<{ phone: string }>

    async login() {
        const userInfo = await this.getUserInfo()
        // 登录成功后，拿到token
        const token = login(userInfo.phone)
        // 拿到token后需要再进行操作
        this.afterLogin(token)
    }

    // 登录成功后操作
    private afterLogin(token: string) {
        console.log(`登录成功后，token：${token}，保存到本地`)
    }
}

// 钉钉登录
class DingTalkLogin extends BaseLogin {
    async getUserInfo() {
        // 获取钉钉的用户信息
        console.log('获取钉钉的用户信息...')
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return { phone: '1234567890' }
    }
}

// 企业微信登录
class QiWeiLogin extends BaseLogin {
    async getUserInfo() {
        // 获取企业微信的用户信息
        console.log('获取企业微信的用户信息...')
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return { phone: '987342341' }
    }
}

// 支付宝登录
class AliPayLogin extends BaseLogin {
    async getUserInfo() {
        // 获取支付宝的用户信息
        console.log('获取支付宝的用户信息...')
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return { phone: '34353345' }
    }
}

const loginMap = {
    dingTalk: DingTalkLogin,
    qiWei: QiWeiLogin,
    aliPay: AliPayLogin
}


// 工厂函数
function loginFactory(type: 'dingTalk' | 'qiWei' | 'aliPay') {
    return new loginMap[type]()
}

// 示例登录
loginFactory('qiWei').login()