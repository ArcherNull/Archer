/**
 * 判断是否为非空数组
 * @param {any} arr - 待判断的值
 * @returns {number|false} 数组长度（真值）或 false
 */
export function isNotEmptyArr(arr) {
    return Array.isArray(arr) && arr.length
}

/**
 * 将值安全转换为数字，无法转换时返回 0
 * @param {string|number} str - 待转换的值
 * @returns {number} 转换后的数字，非法时为 0
 */
export function convertNumber(str) {
    const val = Number(str)
    return isNaN(val) ? 0 : val
}

/**
 * 展示 Toast 信息提示
 * @param {string} text - 提示文案
 * @param {string} [icon='none'] - 图标类型，如 none / success / error / loading
 * @param {number} [duration=2500] - 显示时长（毫秒）
 */
export function showMsg(text, icon = 'none', duration = 2500) {
    uni.showToast({
        title: text,
        icon: icon,
        duration
    })
}

/**
 * 展示模态确认框，返回 Promise
 * @param {string|Object} [props] - 提示内容字符串，或 uni.showModal 配置对象
 * @returns {Promise<UniApp.ShowModalRes>} 用户操作结果；未传入自定义 success/fail 时由 Promise resolve/reject
 */
export function showModal(props) {
    console.log('模态框展示')
    return new Promise((resolve, reject) => {
        let defaultProps = {
            title: '提示',
            confirmText: '确定',
            cancelText: '取消'
        }

        if (props) {
            if (typeof props === 'string') {
                defaultProps.content = props
            } else {
                defaultProps = Object.assign(defaultProps, props)
            }
        }

        uni.showModal({
            ...defaultProps,
            success: typeof defaultProps?.success === 'function' ? defaultProps.success : resolve,
            fail: typeof defaultProps?.fail === 'function' ? defaultProps.fail : reject
        })
    })
}

/**
 * 延时等待（秒）
 * @param {number} time - 等待秒数
 * @returns {Promise<true>} time 秒后 resolve(true)
 */
export function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true)
        }, time * 1000)
    })
}

function callApi(uniName, wxName) {
    try {
        if (typeof uni !== 'undefined' && typeof uni[uniName] === 'function') {
            return uni[uniName]() || {}
        }
    } catch (e) {}
    try {
        if (typeof wx !== 'undefined' && typeof wx[wxName] === 'function') {
            return wx[wxName]() || {}
        }
    } catch (e2) {}
    return null
}

/**
 * 窗口信息（替代 getSystemInfoSync 中的宽高字段）
 * 优先 wx.getWindowInfo / uni.getWindowInfo
 */
export function getWindowInfoSafe() {
    const info = callApi('getWindowInfo', 'getWindowInfo')
    if (info) return info
    try {
        const s = uni.getSystemInfoSync() || {}
        return {
            windowWidth: s.windowWidth,
            windowHeight: s.windowHeight,
            screenWidth: s.screenWidth,
            screenHeight: s.screenHeight,
            statusBarHeight: s.statusBarHeight,
            safeArea: s.safeArea,
            safeAreaInsets: s.safeAreaInsets,
            pixelRatio: s.pixelRatio,
        }
    } catch (e) {
        return {
            windowWidth: 375,
            windowHeight: 667,
            screenWidth: 375,
            screenHeight: 667,
        }
    }
}

/**
 * 设备信息（品牌 / 型号 / 系统等）
 */
export function getDeviceInfoSafe() {
    const info = callApi('getDeviceInfo', 'getDeviceInfo')
    if (info) return info
    try {
        const s = uni.getSystemInfoSync() || {}
        return {
            brand: s.brand,
            model: s.model,
            system: s.system,
            platform: s.platform,
            memorySize: s.memorySize,
            deviceAbi: s.deviceAbi,
            deviceType: s.deviceType,
            deviceOrientation: s.deviceOrientation,
            devicePixelRatio: s.devicePixelRatio || s.pixelRatio,
            benchmarkLevel: s.benchmarkLevel,
        }
    } catch (e) {
        return {}
    }
}

/**
 * 应用基础信息（SDKVersion / language 等）
 */
export function getAppBaseInfoSafe() {
    const info = callApi('getAppBaseInfo', 'getAppBaseInfo')
    if (info) return info
    try {
        const s = uni.getSystemInfoSync() || {}
        return {
            SDKVersion: s.SDKVersion,
            enableDebug: s.enableDebug,
            host: s.host,
            language: s.language,
            version: s.version,
            theme: s.theme,
            fontSizeScaleFactor: s.fontSizeScaleFactor,
            fontSizeSetting: s.fontSizeSetting,
        }
    } catch (e) {
        return {}
    }
}

/**
 * 兼容旧版 uni.getSystemInfoSync 的聚合结果
 * 优先使用拆分 API，避免 wx.getSystemInfoSync 弃用告警
 */
export function getSystemInfoCompat() {
    const windowInfo = getWindowInfoSafe()
    const deviceInfo = getDeviceInfoSafe()
    const appBaseInfo = getAppBaseInfoSafe()
    const merged = Object.assign({}, deviceInfo, appBaseInfo, windowInfo)

    // 旧字段别名，兼容现有业务读取
    if (!merged.osName && merged.platform) {
        merged.osName = merged.platform
    }
    if (!merged.deviceBrand && merged.brand) {
        merged.deviceBrand = merged.brand
    }
    if (!merged.deviceModel && merged.model) {
        merged.deviceModel = merged.model
    }
    if (!merged.pixelRatio && merged.devicePixelRatio) {
        merged.pixelRatio = merged.devicePixelRatio
    }
    return merged
}
