import * as gbk from '../sdk/CC3/printUtil-GBK.js'
import { hexStringToBuff } from '../sdk/HM/util.js'
import {
    isNotEmptyArr,
    convertNumber,
    showMsg,
    showModal,
    sleep,
} from '../comm/utils.js'
import {
    ERROR_CODE,
    BLUETOOTH_MODULE_STATE,
    BLUETOOTH_MODULE_SEARCH_STATE,
    STORAGE_KEY,
    STORAGE_SYSTEM_CONFIG_KEY,
    CPCL_DEVICE_NAME_PREFIXES,
    GBK_DEVICE_NAME_PREFIXES,
    PREFERRED_WRITE_SERVICE_KEYWORDS,
    isPrivacyScopeUndeclaredError,
    formatBluetoothError,
    tipBluetoothError,
    getPlatformDefaultConfigByOs,
    clampPrintConfigValues,
    resolvePrinterBrandInfo,
    loadPrintTasks,
    savePrintTasks,
    appendPrintTask,
    extractDevicesFromPrintTasks,
} from './config.js'


/**
 * 低功耗蓝牙打印机适配器
 * 多设备连接 / 消息订阅 / 连接历史 / 打印任务
 */
export class BleBlueTooth {
    // 区分苹果 / 安卓 / 鸿蒙
    _osName
    // 手机设备名称（品牌 + 型号）
    _deviceName = ''
    // 是否鸿蒙（含 HarmonyOS Next / 卓易通兼容层）
    _isHarmonyOS = false
    // 设置蓝牙最大传输单元
    _mtu = 512
    // 实际协商后的 MTU（失败则回退默认分包）
    _negotiatedMtu = 0

    // 重启蓝牙模块次数
    _restartBlueToothCount = 0
    // 重启蓝牙模块最大次数
    _restartBlueToothMaxCount = 3
    // 是否正在执行重启流程（防连点）
    _isRestartingBlueTooth = false
    // 关闭适配器后再打开的间隔（部分机型需要短暂等待）
    _reopenDelayMs = 500

    // 蓝牙模块适配器状态
    _bluetoothAdapterState = {
        available: false,
        discovering: false,
    }

    // 是否校验蓝牙授权（微信小程序需开启；H5 可关闭）
    _isAuthSettingBluetooth = true
    // 蓝牙模块状态， 未启动 notStarted ;  已启动 started ; 正在启动  starting
    _bluetoothModuleState = BLUETOOTH_MODULE_STATE.NOT_STARTED
    // 蓝牙模块搜索蓝牙设备状态， 未搜索 notSearched ;  已搜索 searched ; 正在搜索  searching
    _bluetoothModuleSearchState = BLUETOOTH_MODULE_SEARCH_STATE.NOT_SEARCHED
    // 搜索设备结果列表
    _searchDevicesResultList = []
    // 已经连接蓝牙设备列表
    _connectedDevicesList = []
    // 是否处于持续扫描中（手动取消前不停止）
    _continuousDiscovering = false
    // 是否已注册 onBluetoothDeviceFound 持续扫描监听
    _continuousFoundListening = false
    // CPCL 打印设备名称前缀，设备名 startsWith 任一前缀即走 CPCL（如 HM-A300L、HM-A300-668B）；可手动追加
    _cpclDeviceNamePrefixes = [...CPCL_DEVICE_NAME_PREFIXES]
    // GBK 打印设备名称前缀：芝柯 CC3_ / 优博讯 K319
    _gbkDeviceNamePrefixes = [...GBK_DEVICE_NAME_PREFIXES]
    // 常见打印机可写服务 UUID 关键词（优先匹配，避免选到错误特征值）
    _preferredWriteServiceKeywords = [...PREFERRED_WRITE_SERVICE_KEYWORDS]
    // 正在连接的设备信息
    _operationDevicesInfo = {}

    // 打印模式， 同步 sync  异步 async
    _printMode = 'sync'
    // 打印任务列表
    _printTaskList = []
    // 同步打印最大并发执行次数， 也就是说3个打印任务可以同时执行，超出则等待
    _doPrintTaskMaxCount = 3

    // 本地化存储打印机的键值
    _storageKey = STORAGE_KEY
    // 历史连接列表
    _historyPrintDeviceList = []

    // 是否输出调试日志
    _debugLogEnabled = false


    // 系统配置存储键值
    _storageSystemConfigKey = STORAGE_SYSTEM_CONFIG_KEY

    // 系统初始化设置（由平台决定默认值，见 getPlatformDefaultConfig）
    _systemDefaultConfig = {}
    // 当前打印配置（可被界面覆盖）
    _printConfig = {}
    // 打印任务中断标记（超时 / 手动中断）
    _printAborted = false
    // 用户取消：终止全部打印任务（含递归重试），直至本轮 print 结束才复位
    _printCancelled = false
    // 递进打印任务级最大重试轮次
    _recursivePrintMaxRound = 5
    // 打印进度信息
    _printProgress = {
        status: 'idle',
        estimatedSec: 0,
        printProgress: 0,
        transferProgress: 0,
        elapsedSec: 0,
        totalTasks: 0,
        finishedTasks: 0,
        totalBytes: 0,
        sentBytes: 0,
        startTime: 0,
    }
    _printElapsedTimer = null

    constructor() {
        this.init()
    }

    init() {
        this.getSystemInfoSync()
        this.initPrintConfig()
        this.getHistoryPrintDevices()
        this.initEvents()
    }

    // 平台展示名
    getPlatformDisplayName() {
        if (this._isHarmonyOS) return '鸿蒙'
        const os = String(this._osName || '').toLowerCase()
        if (os === 'ios') return 'iOS'
        if (os === 'android') return '安卓'
        return this._osName || '其它'
    }

    // 手机设备名称
    getDeviceDisplayName() {
        return this._deviceName || '未知设备'
    }

    // 各平台初始打印配置
    getPlatformDefaultConfig() {
        return getPlatformDefaultConfigByOs(this._osName, this._isHarmonyOS)
    }

    // 初始化打印配置：优先读本地成功记录，否则用平台默认
    initPrintConfig() {
        this._systemDefaultConfig = this.getPlatformDefaultConfig()
        const saved = this.loadPrintConfig()
        this._printConfig = {
            ...this._systemDefaultConfig,
            ...(saved || {}),
        }
        this.clampPrintConfig(this._printConfig)
        const mtu = convertNumber(this._printConfig.mtu)
        if (mtu > 0) {
            this._mtu = mtu
        }
    }

    // 读取本地成功配置
    loadPrintConfig() {
        try {
            const raw = uni.getStorageSync(this._storageSystemConfigKey)
            if (!raw) return null
            return typeof raw === 'string' ? JSON.parse(raw) : raw
        } catch (e) {
            this.log('loadPrintConfig-fail=====>', e)
            return null
        }
    }

    // 打印成功后记录当前配置
    savePrintConfig(config = this._printConfig) {
        try {
            const data = {
                ...this.getPrintConfig(),
                ...(config || {}),
            }
            this.clampPrintConfig(data)
            uni.setStorageSync(this._storageSystemConfigKey, JSON.stringify(data))
            this._printConfig = data
            const mtu = convertNumber(data.mtu)
            if (mtu > 0) {
                this._mtu = mtu
            }
            this.emit('stateChange')
            return true
        } catch (e) {
            this.log('savePrintConfig-fail=====>', e)
            return false
        }
    }

    // 获取当前打印配置副本
    getPrintConfig() {
        return {
            ...this._systemDefaultConfig,
            ...this._printConfig,
        }
    }

    // 界面更新打印配置
    updatePrintConfig(partial = {}) {
        this._printConfig = {
            ...this.getPrintConfig(),
            ...partial,
        }
        this.clampPrintConfig(this._printConfig)
        // 同步请求 MTU（iOS 不生效，连接时由系统分配）
        const mtu = convertNumber(this._printConfig.mtu)
        if (mtu > 0) {
            this._mtu = mtu
        }
        this.emit('stateChange')
        return this.getPrintConfig()
    }

    // 配置边界裁剪
    clampPrintConfig(cfg = {}) {
        return clampPrintConfigValues(cfg)
    }

    // 递进：打印失败时按步进增大间隔
    progressiveBumpPrintConfig() {
        const cfg = this.getPrintConfig()
        cfg.packetIntervalMs = Math.min(300, cfg.packetIntervalMs + cfg.packetStepMs)
        cfg.retryIntervalMs = Math.min(300, cfg.retryIntervalMs + cfg.retryStepMs)
        this._printConfig = cfg
        this.emit('stateChange')
        this.log('递进打印配置=====>', cfg)
        return cfg
    }

    // 中断当前打印任务（超时或单次中断）
    abortPrint(reason = '打印任务已中断') {
        this._printAborted = true
        this.log('abortPrint=====>', reason)
    }

    // 取消递归打印：终止全部打印任务（含递进重试）
    cancelAllPrintTasks(reason = '已取消所有打印任务') {
        this._printCancelled = true
        this._printAborted = true
        this.updatePrintProgress({
            status: 'cancelled'
        })
        this.refreshPrintElapsed()
        this.emitPrintProgress()
        showMsg(reason)
        return true
    }

    ensurePrintNotAborted() {
        if (this._printCancelled) {
            throw new Error('已取消所有打印任务')
        }
        if (this._printAborted) {
            throw new Error('打印任务已中断')
        }
    }

    getPrintProgress() {
        this.refreshPrintElapsed()
        return {
            ...this._printProgress
        }
    }

    resetPrintProgress(partial = {}) {
        this._printProgress = {
            status: 'idle',
            estimatedSec: 0,
            printProgress: 0,
            transferProgress: 0,
            elapsedSec: 0,
            totalTasks: 0,
            finishedTasks: 0,
            totalBytes: 0,
            sentBytes: 0,
            startTime: 0,
            ...partial,
        }
        this.emitPrintProgress()
    }

    updatePrintProgress(partial = {}) {
        this._printProgress = {
            ...this._printProgress,
            ...partial,
        }
        const totalBytes = this._printProgress.totalBytes || 0
        const sentBytes = this._printProgress.sentBytes || 0
        const totalTasks = this._printProgress.totalTasks || 0
        const finishedTasks = this._printProgress.finishedTasks || 0

        this._printProgress.transferProgress = totalBytes > 0
            ? Math.min(100, Math.round((sentBytes / totalBytes) * 100))
            : 0

        // 打印进度：已完成任务 + 当前任务传输占比
        if (totalTasks > 0) {
            const currentTaskRatio = totalBytes > 0
                ? (sentBytes / totalBytes)
                : 0
            // 用整体字节进度作为打印进度更直观；同时兼顾任务完成数
            const byBytes = currentTaskRatio * 100
            const byTasks = (finishedTasks / totalTasks) * 100
            this._printProgress.printProgress = Math.min(100, Math.round(Math.max(byBytes, byTasks)))
        } else {
            this._printProgress.printProgress = 0
        }
        this.refreshPrintElapsed()
    }

    refreshPrintElapsed() {
        const start = this._printProgress.startTime
        if (start > 0 && (this._printProgress.status === 'printing' || this._printProgress.status === 'cancelled')) {
            this._printProgress.elapsedSec = Number(((Date.now() - start) / 1000).toFixed(1))
        }
    }

    emitPrintProgress() {
        this.emit('printProgress')
        this.emit('stateChange')
    }

    startPrintElapsedTimer() {
        this.stopPrintElapsedTimer()
        this._printElapsedTimer = setInterval(() => {
            if (this._printProgress.status !== 'printing') {
                this.stopPrintElapsedTimer()
                return
            }
            this.refreshPrintElapsed()
            this.emit('printProgress')
        }, 200)
    }

    stopPrintElapsedTimer() {
        if (this._printElapsedTimer) {
            clearInterval(this._printElapsedTimer)
            this._printElapsedTimer = null
        }
    }

    // 估算单任务字节数与分包数
    calcTaskTransferMeta(pTask = {}) {
        const printDataStr = pTask.printDataStr || ''
        const deviceName = this.getPrinterDeviceName(pTask.deviceId, pTask.name, pTask.localName)
        let totalBytes = 0
        let packetCount = 0
        let chunkSize = 20

        if (this.isGbkPrinter(deviceName, pTask.deviceId)) {
            // 芝柯 CC3 / K319：printUtil-GBK
            const buffer = this.getBuffer(printDataStr)
            totalBytes = buffer.byteLength || 0
            chunkSize = this.getWriteChunkSize(totalBytes)
            packetCount = totalBytes > 0 ? Math.ceil(totalBytes / chunkSize) : 0
        } else {
            // 汉印：HPRT util.hexStringToBuff（同 cutCommand）
            const buffer = hexStringToBuff(printDataStr)
            totalBytes = buffer.byteLength || 0
            chunkSize = this._isHarmonyOS ? this.getWriteChunkSize(totalBytes) : 20
            packetCount = totalBytes > 0 ? Math.ceil(totalBytes / chunkSize) : 0
        }
        return {
            totalBytes,
            packetCount,
            chunkSize
        }
    }

    // 预计打印耗时（秒）：按包数 *（包间隔 + 写开销）粗估
    estimatePrintTimeSec(printTaskList = []) {
        if (!isNotEmptyArr(printTaskList)) return 0
        const intervalMs = convertNumber(this.getPrintConfig().packetIntervalMs) || 20
        const writeOverheadMs = 15
        let packetCount = 0
        printTaskList.forEach((task) => {
            packetCount += this.calcTaskTransferMeta(task).packetCount
        })
        const ms = packetCount * (intervalMs + writeOverheadMs)
        return Number(Math.max(0.1, ms / 1000).toFixed(1))
    }

    markTransferBytes(byteLength = 0) {
        const add = Number(byteLength) || 0
        if (add <= 0) return
        this.updatePrintProgress({
            sentBytes: (this._printProgress.sentBytes || 0) + add
        })
        this.emitPrintProgress()
    }

    // 带超时执行
    runWithPrintTimeout(taskFn, timeoutSec) {
        const that = this
        // 用户取消后不可被超时逻辑清掉
        if (!that._printCancelled) {
            that._printAborted = false
        }
        const sec = convertNumber(timeoutSec) || that.getPrintConfig().printTimeoutSec || 40
        return new Promise(async (resolve, reject) => {
            let settled = false
            const timer = setTimeout(() => {
                if (settled) return
                settled = true
                that.abortPrint(`打印任务超时（${sec}s）`)
                reject(new Error(`打印任务超时（${sec}s），已中断`))
            }, sec * 1000)
            try {
                that.ensurePrintNotAborted()
                const res = await taskFn()
                if (!settled) {
                    settled = true
                    clearTimeout(timer)
                    resolve(res)
                }
            } catch (err) {
                if (!settled) {
                    settled = true
                    clearTimeout(timer)
                    reject(err)
                }
            }
        })
    }

    // 获取历史打印机（从一周内打印任务提取设备）
    getHistoryPrintDevices() {
        try {
            const tasks = loadPrintTasks()
            // 若仍有旧设备缓存，迁移后清理
            try {
                const legacy = uni.getStorageSync('kps-history-print-devices')
                if (legacy) {
                    uni.removeStorageSync('kps-history-print-devices')
                }
            } catch (e) {}
            this._historyPrintDeviceList = extractDevicesFromPrintTasks(tasks)
        } catch (e) {
            this._historyPrintDeviceList = []
        }
    }

    /** 刷新内存中的历史设备列表 */
    refreshHistoryDevicesFromTasks() {
        this._historyPrintDeviceList = extractDevicesFromPrintTasks(loadPrintTasks())
        return this._historyPrintDeviceList
    }

    /**
     * 真正执行打印后缓存任务（仅保留一周）
     * @param {Object} task
     */
    cachePrintTaskHistory(task) {
        if (!task || !task.deviceId || !task.printDataStr) return
        appendPrintTask({
            deviceId: task.deviceId,
            name: task.name || '',
            localName: task.localName || '',
            serviceId: task.serviceId || '',
            characteristicId: task.characteristicId || '',
            writeType: task.writeType || '',
            templateName: task.templateName || '打印任务',
            printTime: task.printTime || Date.now(),
            printDataStr: task.printDataStr || '',
            printType: task.printType || '',
        })
        this.refreshHistoryDevicesFromTasks()
    }

    /** 蓝牙模块调试日志（受 _debugLogEnabled 控制） */
    log(...args) {
        if (!this._debugLogEnabled) return
        console.log('[Bluetooth]', ...args)
    }

    // 初始化发布订阅事件
    initEvents() {
        this.eventMap = new Map()
        // 蓝牙模块断开事件以及蓝牙模块搜索蓝牙设备事件
        this.eventMap.set('stateChange', new Set([]))
        // 打印进度事件
        this.eventMap.set('printProgress', new Set([]))

        this.on = (event, handler) => {
            if (!this.eventMap.has(event)) {
                this.eventMap.set(event, new Set([]))
            }
            this.eventMap.get(event).add(handler)
        }

        this.off = (event, handler) => {
            this.eventMap.get(event)?.delete(handler)
        }

        this.emit = (event) => {
            const handlers = this.eventMap.get(event)
            if (!handlers) return
            handlers.forEach(h => {
                h.call(this, this)
            });
        }
    }

    // 处理错误信息
    dealFailRes(res, reject, text = '初始化蓝牙模块失败') {
        const eMsg = formatBluetoothError(res, text)
        this.log('错误提示=====>', eMsg, res)
        showMsg(eMsg)
        const err = new Error(eMsg || text)
        err.errno = res?.errno
        err.errCode = res?.errCode
        reject(err)
    }

    // 启动蓝牙
    async setupBlueTooth({ silent = false } = {}) {
        const that = this
        try {
            if (that._bluetoothModuleState === 'starting') {
                !silent && showMsg('蓝牙模块正在启动中，请耐心等待')
                return null
            }

            !silent && uni.showLoading({
                title: '启动中...'
            })

            that._bluetoothModuleState = 'starting'
            that.emit('stateChange')
            // 微信：先隐私协议，再蓝牙授权，最后打开适配器
            await that.ensurePrivacyAuthorize()
            await that.checkAndRequestPermissions()
            await that.openBluetoothAdapter()
            const aRes = await that.getBluetoothAdapterState()
            that._bluetoothModuleState = 'started'
            that._restartBlueToothCount = 0
            !silent && showMsg('蓝牙启动成功', 'success')
            // 异步蓝牙适配器状态变化
            that.onBluetoothAdapterStateChange()
            that.emit('stateChange')
            return aRes
        } catch (err) {
            that._bluetoothModuleState = 'notStarted'
            that.emit('stateChange')
            !silent && await tipBluetoothError(err?.message || '启动蓝牙失败')
            throw err
        } finally {
            uni.hideLoading()
        }
    }

    // 重新搜索结果（先重启蓝牙模块，再搜索）
    async reSearchNearByBlueTooth() {
        const that = this
        const mFun = async () => {
            that._connectedDevicesList = []
            that._searchDevicesResultList = []
            that._operationDevicesInfo = {}
            try {
                if (that._bluetoothModuleState === 'starting') {
                    showMsg('蓝牙模块正在启动中，请耐心等待')
                    return
                }
                if (that._isRestartingBlueTooth) {
                    showMsg('蓝牙模块正在重启中，请稍候')
                    return
                }
                that._isRestartingBlueTooth = true
                uni.showLoading({
                    title: '重启中...'
                })
                // 有搜索先停，再关适配器，再重新启动后搜索
                if (that._bluetoothModuleSearchState === 'searching') {
                    try {
                        await that.stopBluetoothDevicesDiscovery()
                    } catch (e) {
                        that.log('重新搜索前停止搜索忽略=====>', e)
                    }
                }
                await that.safeCloseBluetoothAdapter()
                await sleep(that._reopenDelayMs / 1000)
                await that.setupBlueTooth({
                    silent: true
                })
                await that.searchNearByBlueTooth()
            } catch (err) {
                await tipBluetoothError(err?.message || '重新搜索失败')
            } finally {
                that._isRestartingBlueTooth = false
                uni.hideLoading()
            }
        }

        if (that._searchDevicesResultList.length) {
            const res = await showModal({
                title: "温馨提示",
                content: `您确定重新刷新蓝牙搜索结果？`,
            });
            res?.confirm && await mFun()
        } else {
            await mFun()
        }
    }

    
    /**
     * 过滤低功耗蓝牙打印机（参考 HPRT filterPrint）
     * advertisData 转 hex 后长度为 16，或设备名匹配支持机型
     */
    filterPrint(list = [], excludeDeviceIds = []) {
        const printList = []
        const exclude = new Set((excludeDeviceIds || []).map((id) => String(id)))
        for (let i = 0; i < list.length; i++) {
            const item = list[i]
            if (!item || exclude.has(String(item.deviceId))) continue
            const name = String(item.name || item.localName || '').trim()
            const nameUpper = name.toUpperCase()
            const matchName = CPCL_DEVICE_NAME_PREFIXES.concat(GBK_DEVICE_NAME_PREFIXES).some((prefix) => {
                const p = String(prefix).trim().toUpperCase()
                return p && (nameUpper.startsWith(p) || nameUpper.includes(p))
            })

            let address = ''
            let advOk = false
            try {
                const adv = item.advertisData
                if (adv) {
                    const bytes = new Uint8Array(adv)
                    const str = Array.prototype.map
                        .call(bytes, (x) => ('00' + x.toString(16)).slice(-2))
                        .join('')
                    if (str.length === 16) {
                        advOk = true
                        address = str.toUpperCase()
                    }
                }
            } catch (e) {
                // ignore
            }

            if (advOk || matchName) {
                printList.push({
                    ...item,
                    address: address || item.address || '',
                })
            }
        }
        return printList
    }

    // 搜索附近蓝牙设备, type两种搜索模式， finded 获取已搜索过后的结果， finding 持续搜素
    // findResultType 找到结果类型 ， refresh 表示重新刷新，continue 表示在原有的基础上查找
    async searchNearByBlueTooth(type = "finded", findResultType = 'refresh') {
        const that = this
        const searchTime = 6
        try {
            that._continuousDiscovering = false
            if (findResultType === 'refresh') {
                that._searchDevicesResultList = []
            }
            if (that._bluetoothModuleState === 'starting') {
                showMsg('蓝牙模块正在启动中，请耐心等待')
                return
            } else if (that._bluetoothModuleState === 'notStarted') {
                await that.setupBlueTooth()
            }
            uni.showLoading({
                title: `搜索中${searchTime}s...`
            })
            const isSearch = await that.startBluetoothDevicesDiscovery()
            if (isSearch) {
                let dList = []
                if (type === 'finded') {
                    // 搜索6s
                    await sleep(searchTime)
                    that.stopBluetoothDevicesDiscovery()
                    // 第一种方式直接获取
                    dList = await that.recGetBluetoothDevices()
                } else {
                    const startTime = new Date().getTime()
                    const endTime = startTime + searchTime * 1000
                    const callback = (res) => {
                        const nTime = new Date().getTime()
                        let bool = false
                        const list = res?.devices || []
                        this.log('接收到信息', res?.devices)
                        dList.push(...list)
                        if (nTime > endTime) {
                            bool = true
                        }
                        return bool
                    }
                    // 第二种方式通过监听, 持续查找
                    await that.onBluetoothDeviceFound(callback)
                }

                // 先按低功耗打印机规则过滤（HPRT filterPrint + 机型名前缀）
                const filtered = that.filterPrint(
                    dList,
                    that._connectedDevicesList.map((d) => d.deviceId)
                )
                const nList = []
                filtered.forEach(item => {
                    const name = item?.name || item?.localName
                    const deviceId = item?.deviceId
                    let bool = false
                    // #ifdef MP-WEIXIN
                    bool = name && deviceId && (item.connectable !== false)
                    // #endif
                    // #ifndef MP-WEIXIN
                    bool = !!(name && deviceId)
                    // #endif
                    if (bool) {
                        const findItem = that._connectedDevicesList.find(ele => ele.deviceId === item
                            .deviceId)

                        const obj = {
                            ...item,
                            services: [],
                            isConnect: findItem ? true : false,
                            name,
                            ...findItem,
                        }
                        if (findResultType === 'continue') {
                            const findIndex = that._searchDevicesResultList.findIndex(ele => ele
                                .deviceId ===
                                item
                                    .deviceId)
                            findIndex === -1 && nList.push(obj)
                        } else {
                            nList.push(obj)
                        }
                    }
                })

                this.log('nList========>', nList)
                if (findResultType === 'continue') {
                    that._searchDevicesResultList.push(...nList)
                } else {
                    that._searchDevicesResultList = nList
                }
                return nList
            } else {
                showMsg('未开启搜索蓝牙设备')
            }
        } catch (err) {
            uni.hideLoading()
            showMsg(err?.message || '搜索附近蓝牙设备失败')
        } finally {
            uni.hideLoading()
            that.stopBluetoothDevicesDiscovery()
        }
    }

    /**
     * 将发现的原始设备列表合并进搜索结果（过滤打印机规则）
     * @param {Array} dList
     * @param {'refresh'|'continue'} findResultType
     */
    _mergeDiscoveredDevices(dList = [], findResultType = 'continue') {
        const that = this
        const filtered = that.filterPrint(
            dList,
            that._connectedDevicesList.map((d) => d.deviceId)
        )
        const nList = []
        filtered.forEach((item) => {
            const name = item?.name || item?.localName
            const deviceId = item?.deviceId
            let bool = false
            // #ifdef MP-WEIXIN
            bool = name && deviceId && (item.connectable !== false)
            // #endif
            // #ifndef MP-WEIXIN
            bool = !!(name && deviceId)
            // #endif
            if (!bool) return
            const findItem = that._connectedDevicesList.find((ele) => ele.deviceId === item.deviceId)
            const obj = {
                ...item,
                services: [],
                isConnect: !!findItem,
                name,
                ...findItem,
            }
            if (findResultType === 'continue') {
                const findIndex = that._searchDevicesResultList.findIndex((ele) => ele.deviceId === item.deviceId)
                if (findIndex === -1) {
                    nList.push(obj)
                } else {
                    const prev = that._searchDevicesResultList[findIndex]
                    that._searchDevicesResultList.splice(findIndex, 1, {
                        ...prev,
                        ...obj,
                        isConnect: prev.isConnect || obj.isConnect,
                        serviceId: prev.serviceId || obj.serviceId,
                        characteristicId: prev.characteristicId || obj.characteristicId,
                    })
                }
            } else {
                nList.push(obj)
            }
        })
        if (findResultType === 'continue') {
            that._searchDevicesResultList.push(...nList)
        } else {
            that._searchDevicesResultList = nList
        }
        return nList
    }

    /**
     * 开始持续扫描附近蓝牙设备（需手动调用 stopContinuousDeviceDiscovery 取消）
     * @param {'refresh'|'continue'} findResultType
     */
    async startContinuousDeviceDiscovery(findResultType = 'continue') {
        const that = this
        try {
            if (that._bluetoothModuleState === 'starting') {
                showMsg('蓝牙模块正在启动中，请耐心等待')
                return false
            }
            if (that._bluetoothModuleState === 'notStarted') {
                await that.setupBlueTooth()
            }
            if (findResultType === 'refresh') {
                that._searchDevicesResultList = []
            }
            // 已在持续扫描时：主动拉取系统缓存设备（清空列表后 found 不会再回调旧设备）
            if (that._continuousDiscovering) {
                await that._pullCachedDevicesIntoSearchList()
                return true
            }
            // 先停再开，避免 allowDuplicatesKey=false 时旧设备不再上报
            if (that._bluetoothModuleSearchState === 'searching') {
                try {
                    await that.stopBluetoothDevicesDiscovery()
                } catch (e) {}
            }
            const isSearch = await that.startBluetoothDevicesDiscovery({
                allowDuplicatesKey: true,
            })
            if (!isSearch) {
                showMsg('未开启搜索蓝牙设备')
                return false
            }
            that._continuousDiscovering = true
            if (!that._continuousFoundListening) {
                that._continuousFoundListening = true
                uni.onBluetoothDeviceFound(function (res) {
                    if (!that._continuousDiscovering) return
                    const list = res?.devices || []
                    that._mergeDiscoveredDevices(list, 'continue')
                    that.emit('stateChange')
                })
            }
            // 适配器会话内已发现过的设备不会再次触发 found，需主动回填
            await that._pullCachedDevicesIntoSearchList()
            that.emit('stateChange')
            return true
        } catch (err) {
            that._continuousDiscovering = false
            showMsg(err?.message || '持续搜索蓝牙设备失败')
            return false
        }
    }

    /**
     * 从系统蓝牙缓存拉取已发现设备并合并进搜索列表
     */
    async _pullCachedDevicesIntoSearchList() {
        const that = this
        try {
            const cached = await that.getBluetoothDevices()
            that._mergeDiscoveredDevices(cached || [], 'continue')
            that.emit('stateChange')
        } catch (e) {
            that.log('_pullCachedDevicesIntoSearchList fail', e)
        }
    }

    /**
     * 停止持续扫描
     */
    async stopContinuousDeviceDiscovery() {
        const that = this
        that._continuousDiscovering = false
        try {
            if (that._bluetoothModuleSearchState === 'searching') {
                await that.stopBluetoothDevicesDiscovery()
            }
        } catch (e) {
            that._bluetoothModuleSearchState = that._searchDevicesResultList.length
                ? BLUETOOTH_MODULE_SEARCH_STATE.SEARCHED
                : BLUETOOTH_MODULE_SEARCH_STATE.NOT_SEARCHED
        }
        if (that._searchDevicesResultList.length) {
            that._bluetoothModuleSearchState = BLUETOOTH_MODULE_SEARCH_STATE.SEARCHED
        }
        that.emit('stateChange')
        return true
    }

    /**
     * 清空已搜索设备列表（不影响已连接）
     */
    clearSearchDevicesResultList() {
        this._searchDevicesResultList = []
        if (!this._continuousDiscovering) {
            this._bluetoothModuleSearchState = BLUETOOTH_MODULE_SEARCH_STATE.NOT_SEARCHED
        }
        this.emit('stateChange')
    }

    /**
     * 全部中断：断开所有已连接设备并清空已连接列表
     */
    async disconnectAllConnectedDevices() {
        const that = this
        const list = (that._connectedDevicesList || []).slice()
        if (!list.length) {
            that._connectedDevicesList = []
            that.emit('stateChange')
            showMsg('当前没有已连接设备')
            return true
        }
        uni.showLoading({
            title: '全部中断中...',
        })
        try {
            for (let i = 0; i < list.length; i++) {
                const device = list[i]
                if (!device || !device.deviceId) continue
                try {
                    await new Promise((resolve) => {
                        uni.closeBLEConnection({
                            deviceId: device.deviceId,
                            success: () => resolve(true),
                            fail: () => resolve(false),
                        })
                    })
                } catch (e) {}
            }
            that._connectedDevicesList = []
            that._searchDevicesResultList = (that._searchDevicesResultList || []).map((ele) => ({
                ...ele,
                isConnect: false,
                connectState: 'notConnected',
            }))
            that.emit('stateChange')
            showMsg('已全部中断连接', 'success')
            return true
        } finally {
            uni.hideLoading()
        }
    }

    // 连接历史设备
    async connectHistoryPrintDevices() {
        const that = this
        try {
            if (isNotEmptyArr(that._historyPrintDeviceList)) {
                that._searchDevicesResultList.push(...that._historyPrintDeviceList)
                that.log('that._bluetoothModuleState', that._bluetoothModuleState)
                if (that._bluetoothModuleState === 'started') {
                    const mList = that._historyPrintDeviceList.map(ele => {
                        return that.connectBlueToothPrinter(ele)
                    })
                    await Promise.race(mList)
                } else {
                    throw new Error('蓝牙模块未启动，历史打印机连接失败')
                }
            }
        } catch (err) {
            showMsg(err?.message || '历史打印机连接失败')
        }
    }


    // 平台是否支持蓝牙
    getSystemInfoSync() {
        const systemInfo = uni.getSystemInfoSync() || {}
        this._osName = systemInfo.osName || systemInfo.platform || ''
        this._isHarmonyOS = this.detectHarmonyOS(systemInfo)
        this._deviceName = this.resolveDeviceName(systemInfo)
        this.log('bluetooth-os=====>', {
            osName: this._osName,
            platform: systemInfo.platform,
            system: systemInfo.system,
            romName: systemInfo.romName,
            deviceName: this._deviceName,
            isHarmonyOS: this._isHarmonyOS,
        })
    }

    // 解析手机设备名称
    resolveDeviceName(systemInfo = {}) {
        const brand = String(systemInfo.brand || systemInfo.deviceBrand || '').trim()
        const model = String(
            systemInfo.deviceModel ||
            systemInfo.model ||
            systemInfo.deviceId ||
            ''
        ).trim()
        if (brand && model) {
            // 型号已包含品牌时避免重复，如 Xiaomi / Xiaomi 14
            if (model.toLowerCase().startsWith(brand.toLowerCase())) {
                return model
            }
            return `${brand} ${model}`
        }
        return model || brand || ''
    }

    // 识别鸿蒙（纯血 / 兼容 Android 层 / 卓易通）
    detectHarmonyOS(systemInfo = {}) {
        const osName = String(systemInfo.osName || '').toLowerCase()
        const platform = String(systemInfo.platform || '').toLowerCase()
        const system = String(systemInfo.system || '').toLowerCase()
        const romName = String(systemInfo.romName || '').toLowerCase()
        return osName.includes('harmony') ||
            platform === 'harmony' ||
            platform.includes('harmony') ||
            system.includes('harmony') ||
            romName.includes('harmony')
    }

    // 单次写入分包大小：鸿蒙协议栈缓冲弱，强制小包更稳
    getWriteChunkSize(totalLength = 0) {
        if (this._osName === 'ios') {
            return totalLength || 20
        }
        const cfgMtu = convertNumber(this.getPrintConfig().mtu) || this._mtu || 23
        if (this._isHarmonyOS) {
            // 鸿蒙上 MTU 协商常不可靠；以配置为准，协商成功也不超过配置与 50
            const mtu = this._negotiatedMtu || cfgMtu
            return Math.max(20, Math.min(mtu - 3, Math.min(cfgMtu, 50)))
        }
        const mtu = this._negotiatedMtu || cfgMtu
        return Math.min(Math.max(mtu - 3, 20), Math.min(cfgMtu, 512))
    }

    // 包间隔：优先使用界面配置；未配置时按平台默认
    getWriteIntervalSec() {
        const cfg = this.getPrintConfig()
        const ms = convertNumber(cfg.packetIntervalMs)
        if (ms > 0) {
            return ms / 1000
        }
        if (this._isHarmonyOS) {
            return 0.08
        }
        return 0.02
    }

    // 单包重试间隔（秒）
    getRetryIntervalSec() {
        const cfg = this.getPrintConfig()
        const ms = convertNumber(cfg.retryIntervalMs)
        if (ms > 0) {
            return ms / 1000
        }
        return this._isHarmonyOS ? 0.12 : 0.05
    }

    // 单包最大重试次数
    getMaxPacketRetry() {
        const cfg = this.getPrintConfig()
        const n = Number(cfg.maxPacketRetry)
        if (!isNaN(n) && n >= 0) {
            return n
        }
        return this._isHarmonyOS ? 3 : 2
    }

    // 鸿蒙默认走带响应写；若连接时已按特征值能力选定，则尊重该类型
    resolveWriteType(preferredWriteType) {
        if (this._isHarmonyOS) {
            return preferredWriteType || 'write'
        }
        return preferredWriteType || 'writeNoResponse'
    }

    // 微信小程序：确保用户已同意隐私协议（未声明后台接口时仍会报 errno 112）
    ensurePrivacyAuthorize() {
        return new Promise((resolve, reject) => {
            // #ifdef MP-WEIXIN
            if (typeof uni.getPrivacySetting !== 'function') {
                resolve(true)
                return
            }
            uni.getPrivacySetting({
                success: (res) => {
                    this.log('getPrivacySetting=====>', res)
                    if (!res?.needAuthorization) {
                        resolve(true)
                        return
                    }
                    if (typeof uni.requirePrivacyAuthorize !== 'function') {
                        // 交由系统官方弹窗处理
                        resolve(true)
                        return
                    }
                    uni.requirePrivacyAuthorize({
                        success: () => resolve(true),
                        fail: (err) => {
                            this.log('requirePrivacyAuthorize-fail=====>', err)
                            if (isPrivacyScopeUndeclaredError(err)) {
                                reject(new Error(ERROR_CODE['112']))
                                return
                            }
                            reject(new Error(formatBluetoothError(err, '请先同意隐私协议后再使用蓝牙')))
                        }
                    })
                },
                fail: (err) => {
                    this.log('getPrivacySetting-fail=====>', err)
                    // 低版本基础库可能无此能力，继续后续流程
                    resolve(true)
                }
            })
            // #endif
            // #ifndef MP-WEIXIN
            resolve(true)
            // #endif
        })
    }

    // 蓝牙是否授权
    checkAndRequestPermissions() {
        const that = this
        return new Promise((resolve, reject) => {
            if (!that._isAuthSettingBluetooth) {
                resolve(true)
                return
            }

            // #ifdef MP-WEIXIN
            uni.getSetting({
                success: (res) => {
                    that.log('蓝牙是否授权res', res)
                    const isPers = res?.authSetting?.['scope.bluetooth']
                    if (isPers === true) {
                        resolve(true)
                        return
                    }
                    if (isPers === false) {
                        showModal({
                            title: '是否授权蓝牙连接',
                            content: '需要获取您的蓝牙模块，用于连接蓝牙打印机',
                        }).then((modalRes) => {
                            if (!modalRes?.confirm) {
                                reject(new Error('授权失败'))
                                return
                            }
                            uni.openSetting({
                                success: (settingRes) => {
                                    const isPass = settingRes?.authSetting?.['scope.bluetooth'] === true
                                    if (isPass) {
                                        showMsg('授权成功', 'success')
                                        resolve(true)
                                    } else {
                                        reject(new Error('授权失败'))
                                    }
                                },
                                fail: () => reject(new Error('打开设置失败'))
                            })
                        }).catch(() => reject(new Error('授权失败')))
                        return
                    }
                    // undefined：尚未询问，主动拉起授权
                    uni.authorize({
                        scope: 'scope.bluetooth',
                        success: () => resolve(true),
                        fail: () => {
                            showModal({
                                title: '是否授权蓝牙连接',
                                content: '需要获取您的蓝牙模块，用于连接蓝牙打印机',
                            }).then((modalRes) => {
                                if (!modalRes?.confirm) {
                                    reject(new Error('授权失败'))
                                    return
                                }
                                uni.openSetting({
                                    success: (settingRes) => {
                                        const isPass = settingRes?.authSetting?.['scope.bluetooth'] === true
                                        if (isPass) {
                                            showMsg('授权成功', 'success')
                                            resolve(true)
                                        } else {
                                            reject(new Error('授权失败'))
                                        }
                                    },
                                    fail: () => reject(new Error('打开设置失败'))
                                })
                            }).catch(() => reject(new Error('授权失败')))
                        }
                    })
                },
                fail: (err) => {
                    reject(new Error('蓝牙授权失败,' + (err?.errMsg || String(err))))
                }
            })
            // #endif

            // #ifdef APP-PLUS
            const permissions = [
                'android.permission.BLUETOOTH',
                'android.permission.BLUETOOTH_ADMIN',
                'android.permission.BLUETOOTH_SCAN',
                'android.permission.BLUETOOTH_CONNECT',
                'android.permission.ACCESS_FINE_LOCATION',
            ]
            if (typeof uni.requestAndroidPermissions === 'function') {
                uni.requestAndroidPermissions({
                    permissions,
                    success(res) {
                        if (res.all === true) {
                            resolve(true)
                        } else {
                            reject(new Error('蓝牙授权失败'))
                        }
                    },
                    fail: () => reject(new Error('蓝牙授权失败'))
                })
            } else {
                resolve(true)
            }
            // #endif

            // #ifdef H5
            resolve(true)
            // #endif

            // #ifndef MP-WEIXIN || APP-PLUS || H5
            resolve(true)
            // #endif
        })
    }

    // 清空设备相关缓存（不改模块启停状态）
    clearDeviceLists() {
        this._continuousDiscovering = false
        this._connectedDevicesList = []
        this._searchDevicesResultList = []
        this._operationDevicesInfo = {}
        this._bluetoothModuleSearchState = 'notSearched'
    }

    // 重置蓝牙参数
    resetBTParams() {
        this.clearDeviceLists()
        this._bluetoothModuleState = 'notStarted'
        this._bluetoothAdapterState = {
            available: false,
            discovering: false,
        }
        this._restartBlueToothCount = 0
        this._isRestartingBlueTooth = false
    }

    // 初始化蓝牙模块， 校验蓝牙是否正常
    openBluetoothAdapter() {
        const that = this
        return new Promise((resolve, reject) => {
            // 仅清空设备列表，避免把 starting 状态冲成 notStarted
            that.clearDeviceLists()
            uni.openBluetoothAdapter({
                success: function (res) {
                    that.log('openBluetoothAdapter-success=====>', res)
                    if (res?.errMsg === 'openBluetoothAdapter:ok') {
                        resolve(true)
                    } else {
                        that._bluetoothModuleState = 'notStarted'
                        reject(new Error('蓝牙启动失败'))
                    }
                },
                fail: function (res) {
                    that.log('openBluetoothAdapter-fail=====>', res)
                    const errCode = res?.errCode
                    const errMsg = res?.errMsg || ''
                    // 部分端上重复 open 会报已打开，视为可用
                    if (errCode === 0 || errMsg.includes('already opened') || errMsg.includes('已经打开')) {
                        resolve(true)
                        return
                    }
                    that._bluetoothModuleState = 'notStarted'
                    if (isPrivacyScopeUndeclaredError(res)) {
                        const err = new Error(ERROR_CODE['112'])
                        err.errno = 112
                        reject(err)
                        return
                    }
                    that.dealFailRes(res, reject, '初始化蓝牙模块失败')
                }
            });
        })
    }

    // 安全关闭蓝牙模块（未启动时也视为成功，避免重启链路中断）
    safeCloseBluetoothAdapter() {
        const that = this
        return new Promise((resolve) => {
            that.saveConnectedDevices()
            uni.closeBluetoothAdapter({
                success: (res) => {
                    that.log('closeBluetoothAdapter-success=====>', res)
                    that.clearDeviceLists()
                    that._bluetoothModuleState = 'notStarted'
                    that._bluetoothAdapterState = {
                        available: false,
                        discovering: false,
                    }
                    that.emit('stateChange')
                    resolve(true)
                },
                fail: (res) => {
                    that.log('closeBluetoothAdapter-fail=====>', res)
                    // 未初始化时关闭失败可忽略，保证重启流程可继续
                    that.clearDeviceLists()
                    that._bluetoothModuleState = 'notStarted'
                    that.emit('stateChange')
                    resolve(false)
                }
            })
        })
    }

    // 重启蓝牙模块：先关闭再完整走 setupBlueTooth
    async restartOpenBluetoothAdapter() {
        const that = this
        let consumedRestartQuota = false
        try {
            if (that._isRestartingBlueTooth) {
                showMsg('蓝牙模块正在重启中，请稍候')
                return
            }

            if (that._bluetoothModuleState === 'starting') {
                showMsg('蓝牙模块正在启动中，请耐心等待...')
                return
            }

            if (that._restartBlueToothCount >= that._restartBlueToothMaxCount) {
                showMsg(`重新启动蓝牙模块已超出最大次数${that._restartBlueToothMaxCount}次`)
                return
            }

            const isStarted = that._bluetoothModuleState === 'started'
            const modalRes = await showModal({
                title: '温馨提示',
                content: isStarted ?
                    '蓝牙模块已启动，重新启动将断开已连接设备，是否继续？' :
                    '您确定重新启动蓝牙模块？',
            })
            if (!modalRes?.confirm) {
                return
            }

            that._isRestartingBlueTooth = true
            that._restartBlueToothCount++
            consumedRestartQuota = true
            uni.hideLoading()
            uni.showLoading({
                title: '重启中...'
            })

            // 有搜索先停，再关适配器，再短暂等待后完整启动
            if (that._bluetoothModuleSearchState === 'searching') {
                try {
                    await that.stopBluetoothDevicesDiscovery()
                } catch (e) {
                    this.log('重启前停止搜索忽略=====>', e)
                }
            }

            await that.safeCloseBluetoothAdapter()
            await sleep(that._reopenDelayMs / 1000)
            await that.setupBlueTooth({
                silent: true
            })
            showMsg('蓝牙重启成功', 'success')
            that.emit('stateChange')
        } catch (err) {
            that._bluetoothModuleState = 'notStarted'
            that.emit('stateChange')
            // 配置类错误（未声明隐私接口）不占用重启次数
            if (consumedRestartQuota && isPrivacyScopeUndeclaredError(err)) {
                that._restartBlueToothCount = Math.max(0, that._restartBlueToothCount - 1)
            }
            await tipBluetoothError(err?.message || '重启蓝牙模块失败')
        } finally {
            that._isRestartingBlueTooth = false
            uni.hideLoading()
        }
    }

    // 获取本机蓝牙适配器状态
    getBluetoothAdapterState() {
        const that = this
        return new Promise((resolve, reject) => {
            uni.getBluetoothAdapterState({
                success: (res) => {
                    that.log('getBluetoothAdapterState-success=====>', res)
                    const available = res?.available
                    const discovering = res?.discovering
                    if (res?.errMsg === 'getBluetoothAdapterState:ok' && available ===
                        true) {
                        if (res?.discovering) {
                            that.stopBluetoothDevicesDiscovery()
                        }

                        that._bluetoothAdapterState.available = available
                        that._bluetoothAdapterState.discovering = discovering
                        resolve({
                            available,
                            discovering
                        })
                    } else {
                        reject(new Error('蓝牙适配器不可用，请检查蓝牙模块是否打开，蓝牙权限是否打开'))
                        that._bluetoothModuleState = 'notStarted'
                    }
                },
                fail: (res) => {
                    that.log('getBluetoothAdapterState-fail=====>', res)
                    that._bluetoothModuleState = 'notStarted'
                    that.dealFailRes(res, reject, '蓝牙适配器不可用')
                },
            })
        })
    }

    // 历史设备已改为从打印任务提取，关闭蓝牙时不再写入独立设备缓存
    saveConnectedDevices() {
        this.refreshHistoryDevicesFromTasks()
    }

    // 关闭蓝牙模块
    closeBluetoothAdapter() {
        // uni.closeBluetoothAdapter(OBJECT)
        const that = this
        return new Promise((resolve, reject) => {
            // 保存已连接的蓝牙打印机
            that.saveConnectedDevices()
            uni.closeBluetoothAdapter({
                success: (res) => {
                    that.log('closeBluetoothAdapter-success=====>', res)
                    that._restartBlueToothCount = 0
                    that._waitBlueToothCount = 0
                    that._bluetoothModuleState = 'notStarted'
                    that._bluetoothModuleSearchState = 'notSearched'
                    that._searchDevicesResultList = []
                    that._connectedDevicesList = []
                    resolve(res)
                },
                fail: (res) => {
                    that.log('closeBluetoothAdapter-fail=====>', res)
                    that.dealFailRes(res, reject, '关闭蓝牙模块失败')
                }
            })
        })
    }

    // 搜索附近可用蓝牙设备
    // options.allowDuplicatesKey：持续扫描时建议 true，否则清空列表后旧设备不会再触发 found
    startBluetoothDevicesDiscovery(options = {}) {
        const that = this
        const allowDuplicatesKey = options.allowDuplicatesKey === true
        return new Promise((resolve, reject) => {
            that._bluetoothModuleSearchState = 'searching'
            uni.startBluetoothDevicesDiscovery({
                allowDuplicatesKey,
                interval: 0,
                powerLevel: "high",
                success: function (res) {
                    that.log('startBluetoothDevicesDiscovery-success=====>', res)
                    if (res?.errMsg === 'startBluetoothDevicesDiscovery:ok') {
                        resolve(true)
                    } else {
                        reject(new Error('搜索附近蓝牙设备失败，请检查蓝牙模块是否开启检测蓝牙设备功能'))
                        that._bluetoothModuleSearchState = 'notStarted'
                        that.stopBluetoothDevicesDiscovery()
                    }
                },
                fail: (res) => {
                    that._bluetoothModuleSearchState = 'notSearched'
                    that.stopBluetoothDevicesDiscovery()
                    that.log('startBluetoothDevicesDiscovery-fail=====>', res)
                    that.dealFailRes(res, reject, '搜索附近可用蓝牙设备失败')
                }
            })
        })
    }

    // 停止搜索附近可用蓝牙设备
    stopBluetoothDevicesDiscovery() {
        const that = this
        return new Promise((resolve, reject) => {
            uni.hideLoading()
            uni.stopBluetoothDevicesDiscovery({
                success: (res) => {
                    that.log('stopBluetoothDevicesDiscovery-success=====>', res)
                    if (res?.errMsg === 'stopBluetoothDevicesDiscovery:ok' && res
                        ?.isDiscovering === false) {
                        that._bluetoothModuleSearchState = 'notSearched'
                        resolve(true)
                    } else {
                        reject(new Error('停止搜索附近可用蓝牙设备失败'))
                    }
                },
                fail: (res) => {
                    that.log('stopBluetoothDevicesDiscovery-fail=====>', res)
                    that._bluetoothModuleSearchState = 'notSearched'
                    that.dealFailRes(res, reject, '停止搜索附近可用蓝牙设备失败')
                },
            })
        })
    }

    // 递归获取设备列表
    async recGetBluetoothDevices(count) {
        const that = this
        that.log('递归获取设备列表', count)
        const maxCount = 2
        let cCount = count || 0

        if (cCount < maxCount) {
            cCount++
            const list = await that.getBluetoothDevices(cCount)
            if (isNotEmptyArr(list)) {
                return list
            } else {
                return await that.recGetBluetoothDevices(cCount)
            }
        } else {
            return []
        }
    }

    // 获取在蓝牙模块生效期间所有已发现的蓝牙设备。包括已经和本机处于连接状态的设备。在停止搜索后获取
    getBluetoothDevices() {
        const that = this
        return new Promise((resolve, reject) => {
            uni.getBluetoothDevices({
                success: async function (res) {
                    that.log('getBluetoothDevices蓝牙列表', res)
                    const list = res?.devices || []
                    resolve(list)
                },
                fail: function (res) {
                    that.log("搜索蓝牙设备失败")
                    that.dealFailRes(res, reject, '搜索附近可用蓝牙设备失败')
                }
            })
        })
    }

    // 根据 uuid 获取处于已连接状态的设备。
    getConnectedBluetoothDevices() {
        // uni.getConnectedBluetoothDevices(OBJECT)
        const that = this
        return new Promise((resolve, reject) => {
            uni.getConnectedBluetoothDevices({
                success: (res) => {
                    that.log('getConnectedBluetoothDevices-success=====>', res)
                    const devices = res?.devices || []
                    resolve(devices)
                },
                fail: (res) => {
                    that.log('getConnectedBluetoothDevices-fail=====>', res)
                    that.dealFailRes(res, reject, '获取已连接的蓝牙设备失败')
                }
            })
        })
    }

    // 监听寻找到新设备的事件
    onBluetoothDeviceFound(callback) {
        const that = this
        return new Promise((resolve, reject) => {
            uni.onBluetoothDeviceFound(function (devices) {
                that.log('onBluetoothDeviceFound', devices)
                if (typeof callback === 'function') {
                    const data = JSON.parse(JSON.stringify(devices));
                    const res = callback(data)
                    res && resolve(true)
                } else {
                    resolve(true)
                }
            })
        })
    }

    // 监听蓝牙适配器状态变化事件
    onBluetoothAdapterStateChange() {
        this.log('监听蓝牙适配器状态变化事件')
        const that = this
        return new Promise((resolve, reject) => {
            uni.onBluetoothAdapterStateChange(function (res) {
                that.log('监听蓝牙适配器状态变化事件', res)
                const {
                    available,
                    discovering
                } = res || {}
                if (!available) {
                    that.resetBTParams()
                    showMsg('蓝牙模块已断开，请重新开启蓝牙')
                }
                that.emit('stateChange')
            })
        })
    }

    // 新增/减去连接的设备
    async operationConnectDevice(item) {
        this.log('新增连接的设备', item)
        if (item?.serviceId && item?.characteristicId) {
            const findInd = this._searchDevicesResultList.findIndex(ele => ele.deviceId === item.deviceId)
            const hasInd = this._connectedDevicesList.findIndex(ele => ele.deviceId === item.deviceId)
            // 不在已连接列表：加入；已在列表：断开移除
            if (hasInd === -1) {
                item.isConnect = true
                item.connectState = 'connected'
                if (findInd !== -1) {
                    this._searchDevicesResultList.splice(findInd, 1, item)
                } else {
                    this._searchDevicesResultList.push(item)
                }
                this._connectedDevicesList.push(item)
            } else {
                item.isConnect = false
                item.connectState = 'notConnected'
                if (findInd !== -1) {
                    this._searchDevicesResultList.splice(findInd, 1, item)
                }
                this._connectedDevicesList.splice(hasInd, 1)
            }
        } else {
            showMsg('服务ID或特征ID缺失，请重新连接蓝牙打印机')
        }
    }

    // 校验蓝牙设备
    validateBluetoothDevices(options) {
        const deviceId = options?.deviceId
        if (deviceId) {
            this._operationDevicesInfo = options
            return options
        } else {
            throw new Error('当前设备无设备ID')
        }
    }

    // 更改连接设备状态
    changeConnectState(device = {}, type) {
        const typeList = ['connecting', 'notConnected', 'connected']
        if (typeList.includes(type)) {
            device.connectState = type
            device.isConnect = type === 'connected'
        }
        return device
    }

    // 连接蓝牙打印机
    async connectBlueToothPrinter(options) {
        const that = this
        try {
            const device = that.validateBluetoothDevices(options)
            uni.showLoading({
                title: '连接中...'
            })
            that.changeConnectState(device, 'connecting')
            that._negotiatedMtu = 0
            await that.createBLEConnection(device)
            await that.setBLEMTU(device.deviceId)
            const dealRes = await that.dealServicesAndCharacteristics(device)
            that.log('dealRes=======>', dealRes)
            that.operationConnectDevice(dealRes)
            return dealRes
        } catch (err) {
            uni.hideLoading()
            that.changeConnectState(that._operationDevicesInfo, 'notConnected')
            showMsg(err?.message || '连接蓝牙打印机失败')
        } finally {
            uni.hideLoading()
        }
    }

    // 连接低功耗蓝牙设备
    createBLEConnection(device) {
        const that = this
        return new Promise((resolve, reject) => {
            const {
                deviceId,
                name
            } = device || {}
            if (deviceId) {
                uni.createBLEConnection({
                    deviceId,
                    success: (res) => {
                        that.log("createBLEConnection-success=====>", res);
                        if (res.errMsg == "createBLEConnection:ok") {
                            showMsg(`设备${name}连接成功`)
                            resolve(true)
                        } else {
                            reject(new Error('连接蓝牙设备失败'))
                        }
                    },
                    fail: (res) => {
                        that.log("createBLEConnection-fail=====>", res);
                        that.dealFailRes(res, reject, '初始化蓝牙模块失败')
                    },
                })
            } else {
                reject(new Error('设备ID参数缺失'))
            }
        })
    }

    // 断开设备
    async closeBlueToothPrinter(options) {
        const that = this
        try {
            const device = that.validateBluetoothDevices(options)
            uni.showLoading({
                title: '断开中...'
            })
            that.changeConnectState(device, 'connecting')
            await that.closeBLEConnection(device)
            that.operationConnectDevice(device)
        } catch (err) {
            uni.hideLoading()
            that.changeConnectState(device, 'connected')
            showMsg(err?.message || '断开蓝牙打印机失败')
        } finally {
            uni.hideLoading()
        }
    }

    // 断开与低功耗蓝牙设备的连接
    closeBLEConnection(device) {
        const that = this
        return new Promise((resolve, reject) => {
            const {
                deviceId
            } = device || {}
            if (deviceId) {
                uni.closeBLEConnection({
                    deviceId,
                    success: (res) => {
                        that.log(res)
                        showMsg('断开与低功耗蓝牙设备的连接成功')
                        resolve(true)
                    },
                    fail: (res) => {
                        that.log("closeBLEConnection-fail=====>", res);
                        that.dealFailRes(res, reject, '断开与低功耗蓝牙设备的连接失败')
                    },
                })
            } else {
                reject(new Error('设备ID参数缺失'))
            }
        })
    }

    // 处理服务以及获取设备特征值
    async dealServicesAndCharacteristics(device = {}) {
        const that = this
        try {
            const sRes = await that.getBLEDeviceServices(device)
            let preferred = null
            let fallback = null
            for (let i = 0; i < sRes.length; i++) {
                let sId = sRes[i].uuid
                if (!sId) continue
                const characteristics = await that.getBLEDeviceCharacteristics({
                    ...device,
                    serviceId: sId
                })
                const sIdUpper = String(sId).toUpperCase()
                const isPreferredService = that._preferredWriteServiceKeywords.some(k => sIdUpper.includes(k))
                for (let j = 0; j < characteristics.length; j++) {
                    const cItem = characteristics[j]
                    const props = cItem.properties || {}
                    const canWrite = props.write === true || props.writeNoResponse === true
                    if (!canWrite) continue
                    // 鸿蒙：优先 write（有 ATT 响应，便于流控）；其它平台：优先 writeNoResponse（吞吐更高）
                    let writeType
                    if (that._isHarmonyOS) {
                        writeType = props.write ? 'write' : 'writeNoResponse'
                    } else {
                        writeType = props.writeNoResponse ? 'writeNoResponse' : 'write'
                    }
                    const candidate = {
                        characteristicId: cItem.uuid,
                        serviceId: sId,
                        writeType
                    }
                    const preferCandidate = (current) => {
                        if (!current) return true
                        if (that._isHarmonyOS) {
                            return candidate.writeType === 'write' && current.writeType !== 'write'
                        }
                        return candidate.writeType === 'writeNoResponse' && current.writeType !== 'writeNoResponse'
                    }
                    if (isPreferredService) {
                        if (preferCandidate(preferred)) {
                            preferred = candidate
                        }
                    } else if (preferCandidate(fallback)) {
                        fallback = candidate
                    }
                }
            }
            const selected = preferred || fallback
            if (selected) {
                const nObj = {
                    characteristicId: selected.characteristicId,
                    serviceId: selected.serviceId,
                    writeType: selected.writeType,
                    services: [{
                        characteristicId: selected.characteristicId,
                        serviceId: selected.serviceId,
                    }]
                }
                const ndObj = that.changeConnectState(nObj, 'connected')
                const newDevice = Object.assign(device, ndObj)
                return newDevice
            } else {
                throw new Error('蓝牙打印机服务ID和特征值ID获取失败')
            }
        } catch (err) {
            that.log('err======>123123', err)
            throw new Error(err?.message || '处理蓝牙打印机服务以及获取设备特征值失败')
        }
    }

    // 获取蓝牙设备所有服务(service)。
    getBLEDeviceServices(device) {
        const that = this
        return new Promise((resolve, reject) => {
            const {
                deviceId
            } = device || {}
            if (deviceId) {
                uni.getBLEDeviceServices({
                    deviceId,
                    success: (res) => {
                        that.log("getBLEDeviceServices-success=====>", res);
                        if (res?.errMsg === 'getBLEDeviceServices:ok') {
                            if (isNotEmptyArr(res.services)) {
                                resolve(res.services)
                            } else {
                                reject(new Error('获取蓝牙服务失败！请退出蓝牙重新连接'))
                            }
                        } else {
                            reject(new Error('获取蓝牙服务失败！请退出蓝牙重新连接'))
                        }
                    },
                    fail: (res) => {
                        that.log("getBLEDeviceServices-fail=====>", res);
                        that.dealFailRes(res, reject, '初始化蓝牙模块失败')
                    },
                })
            } else {
                reject(new Error('设备ID参数缺失'))
            }
        })
    }

    // 获取蓝牙设备某个服务中所有特征值(characteristic)。
    getBLEDeviceCharacteristics(device) {
        const that = this
        return new Promise((resolve, reject) => {
            const {
                serviceId,
                deviceId,
                name
            } = device || {}
            if (serviceId && deviceId) {
                uni.getBLEDeviceCharacteristics({
                    deviceId,
                    serviceId,
                    success(res) {
                        that.log("getBLEDeviceCharacteristics-success=====>", res);
                        const cRes = JSON.parse(JSON.stringify(res));
                        if (isNotEmptyArr(cRes.characteristics)) {
                            resolve(cRes.characteristics)
                        } else {
                            reject(new Error(`取蓝牙设备【${name}】某个服务【${serviceId}】中所有特征值失败`))
                        }
                    },
                    fail: (res) => {
                        that.log("getBLEDeviceCharacteristics-fail=====>", res);
                        that.dealFailRes(res, reject,
                            `取蓝牙设备【${name}】某个服务【${serviceId}】中所有特征值失败`)
                    },
                })
            } else {
                reject(new Error(`取蓝牙设备【${name}】缺失服务ID和设备ID`))
            }
        })
    }

    // 校验打印任务
    validatePrintTask(pTask) {
        const {
            deviceId,
            serviceId,
            characteristicId,
            printDataStr
        } = pTask || {}

        const errLog = []
        if (!printDataStr) {
            errLog.push('打印数据不能为空')
        }

        if (!deviceId) {
            errLog.push('打印设备ID不能为空')
        }

        if (!serviceId) {
            errLog.push('打印设备服务ID不能为空')
        }

        if (!characteristicId) {
            errLog.push('打印设备特征值ID不能为空')
        }

        return errLog
    }

    // 设置 CPCL 打印设备名称前缀列表（完全替换）
    setCpclDeviceNamePrefixes(prefixes) {
        if (Array.isArray(prefixes) && prefixes.length) {
            this._cpclDeviceNamePrefixes = prefixes
        }
    }

    // 追加 CPCL 打印设备名称前缀
    addCpclDeviceNamePrefix(prefix) {
        if (prefix && !this._cpclDeviceNamePrefixes.includes(prefix)) {
            this._cpclDeviceNamePrefixes.push(prefix)
        }
    }

    // 获取打印机设备名称（优先任务中的 name，否则从已连接列表查找）
    getPrinterDeviceName(deviceId, taskName, taskLocalName) {
        if (taskName) return taskName
        if (taskLocalName) return taskLocalName
        const device = this._connectedDevicesList.find(d => d.deviceId === deviceId)
        return device?.name || device?.localName || ''
    }

    // 根据设备名称前缀判断是否为 CPCL 打印设备（startsWith / includes）
    isCpclPrinter(deviceName) {
        if (!deviceName) return false
        const name = String(deviceName).trim().toUpperCase()
        return this._cpclDeviceNamePrefixes.some(prefix => {
            const p = String(prefix).trim().toUpperCase()
            return p && (name.startsWith(p) || name.includes(p))
        })
    }

    // 判断是否走 GBK 编码写入（芝柯 CC3 / 优博讯 K319；含手动绑定品牌）
    isGbkPrinter(deviceName, deviceId = '') {
        if (deviceName) {
            const name = String(deviceName).trim().toUpperCase()
            const byPrefix = this._gbkDeviceNamePrefixes.some(prefix => {
                const p = String(prefix).trim().toUpperCase()
                return p && (name.startsWith(p) || name.includes(p))
            })
            if (byPrefix) return true
        }
        // 名称不含 CC3/K319 时，按手动绑定或已识别品牌兜底
        const brandInfo = resolvePrinterBrandInfo(deviceName || '', deviceId)
        return !!(brandInfo && brandInfo.brand === 'CC3')
    }

    // CPCL 指令通常以 "! " 开头，可作为设备名缺失时的兜底判断
    isCpclPrintData(printDataStr) {
        if (!printDataStr || typeof printDataStr !== 'string') return false
        return /^\s*!/.test(printDataStr)
    }

    // 打印， printTaskList 打印任务列表
    async print(printTaskList) {
        const that = this
        try {
            if (isNotEmptyArr(printTaskList)) {
                that._printCancelled = false
                that._printAborted = false

                let totalBytes = 0
                printTaskList.forEach((task) => {
                    totalBytes += that.calcTaskTransferMeta(task).totalBytes
                })
                const estimatedSec = that.estimatePrintTimeSec(printTaskList)
                that.resetPrintProgress({
                    status: 'printing',
                    estimatedSec,
                    totalTasks: printTaskList.length,
                    finishedTasks: 0,
                    totalBytes,
                    sentBytes: 0,
                    printProgress: 0,
                    transferProgress: 0,
                    elapsedSec: 0,
                    startTime: Date.now(),
                })
                that.startPrintElapsedTimer()

                for (let i = 0; i < printTaskList.length; i++) {
                    that.ensurePrintNotAborted()
                    const pTask = printTaskList[i]
                    const errLog = that.validatePrintTask(pTask)
                    if (errLog.length) {
                        throw new Error(`第【${i + 1}】打印任务，${errLog.join(';')}`)
                    }
                    await that.printTaskWithRetry(pTask, i)
                    // 真正执行成功后写入本地打印任务缓存（一周内）
                    that.cachePrintTaskHistory(
                        Object.assign({}, pTask, {
                            printTime: Date.now(),
                        })
                    )
                    that.updatePrintProgress({
                        finishedTasks: i + 1
                    })
                    that.emitPrintProgress()
                }

                that.updatePrintProgress({
                    status: 'success',
                    printProgress: 100,
                    transferProgress: 100,
                    finishedTasks: printTaskList.length,
                    sentBytes: totalBytes
                })
                that.emitPrintProgress()
                return true
            } else {
                showMsg('打印任务列表不能为空')
                return false
            }
        } catch (err) {
            const cancelled = that._printCancelled
            that.updatePrintProgress({
                status: cancelled ? 'cancelled' : 'fail'
            })
            that.emitPrintProgress()
            if (!cancelled) {
                showMsg(err?.message || '打印失败')
            }
            return false
        } finally {
            that.stopPrintElapsedTimer()
            that.refreshPrintElapsed()
            that.emitPrintProgress()
            that._printAborted = false
            that._printCancelled = false
        }
    }

    // 单任务打印：支持超时中断 + 递进重试
    async printTaskWithRetry(pTask, taskIndex = 0) {
        const that = this
        const cfg = that.getPrintConfig()
        const enableRecursive = cfg.enableRecursivePrint !== false
        const maxRound = enableRecursive ? that._recursivePrintMaxRound : 1
        let lastErr = null

        for (let round = 0; round < maxRound; round++) {
            that.ensurePrintNotAborted()
            // 递进重试时回退传输进度到已完成任务，避免重复累计超 100%
            const totalBytes = that._printProgress.totalBytes || 0
            const totalTasks = that._printProgress.totalTasks || 1
            const finishedTasks = that._printProgress.finishedTasks || 0
            that.updatePrintProgress({
                sentBytes: Math.round((finishedTasks / totalTasks) * totalBytes)
            })
            that.emitPrintProgress()
            try {
                await that.runWithPrintTimeout(
                    () => that.printTaskItem(pTask),
                    cfg.printTimeoutSec
                )
                // 成功后记录当前配置
                that.savePrintConfig()
                return true
            } catch (err) {
                lastErr = err
                that.log(`第【${taskIndex + 1}】打印任务第${round + 1}轮失败=====>`, err)
                // 用户取消：不再递进重试
                if (that._printCancelled) {
                    throw err
                }
                if (!enableRecursive || round >= maxRound - 1) {
                    break
                }
                // 递进：增大包间隔 / 重试间隔后再打
                that.progressiveBumpPrintConfig()
                if (!that._printCancelled) {
                    that._printAborted = false
                }
                await sleep(that.getRetryIntervalSec())
            }
        }
        throw lastErr || new Error(`第【${taskIndex + 1}】打印任务失败`)
    }

    // 打印任务项：芝柯/优博讯优先 GBK，其余（含汉印）走 CPCL
    async printTaskItem(pTask) {
        const that = this
        that.ensurePrintNotAborted()
        try {
            const { deviceId, name, localName, printDataStr } = pTask
            const deviceName = that.getPrinterDeviceName(deviceId, name, localName)
            // 1. 优先：芝柯（CC3_）/ 优博讯（K319）/ 手动绑定芝柯 → GBK
            if (that.isGbkPrinter(deviceName, deviceId)) {
                await that.printGbkTaskItem(pTask)
            } else {
                // 2. 其余情况 → 汉印 CPCL hex
                await that.printCpclTaskItem(pTask)
            }
        } catch (err) {
            throw err instanceof Error ? err : new Error(err?.message || '打印任务执行失败')
        }
    }

    // CPCL 打印（汉印）— 对齐 HPRT demo：Print.cpcl() → util.hexStringToBuff → 分包写入
    async printCpclTaskItem(pTask) {
        const that = this
        const { deviceId, serviceId, characteristicId, printDataStr, writeType } = pTask
        const buffer = hexStringToBuff(printDataStr)
        const chunkSize = that._isHarmonyOS ? that.getWriteChunkSize(buffer.byteLength) : 20
        const length = buffer.byteLength
        const count = Math.ceil(length / chunkSize)
        const finalWriteType = that.resolveWriteType(writeType)
        for (let i = 0; i < count; i++) {
            that.ensurePrintNotAborted()
            let tempBuffer
            if (((i + 1) * chunkSize) < length) {
                tempBuffer = buffer.slice(i * chunkSize, (i + 1) * chunkSize)
            } else {
                tempBuffer = buffer.slice(i * chunkSize, length)
            }
            await that.writeBLECharacteristicValue({
                deviceId,
                serviceId,
                characteristicId,
                buffer: tempBuffer,
                writeType: finalWriteType
            })
            that.markTransferBytes(tempBuffer.byteLength)
            await sleep(that.getWriteIntervalSec())
        }
    }

    // GBK 打印（芝柯 CC3 / 优博讯 K319 等）
    async printGbkTaskItem(pTask) {
        const that = this
        const { deviceId, serviceId, characteristicId, printDataStr, writeType } = pTask
        const buffer = that.getBuffer(printDataStr)
        const chunkSize = that.getWriteChunkSize(buffer.byteLength)
        var length = buffer.byteLength
        var count = Math.ceil(length / chunkSize)
        const finalWriteType = that.resolveWriteType(writeType || 'write')
        for (let i = 0; i < count; i++) {
            that.ensurePrintNotAborted()
            let tempBuffer
            if (((i + 1) * chunkSize) < length) {
                tempBuffer = buffer.slice(i * chunkSize, (i + 1) * chunkSize)
            } else {
                tempBuffer = buffer.slice(i * chunkSize, length)
            }
            await that.writeBLECharacteristicValue({
                deviceId,
                serviceId,
                characteristicId,
                buffer: tempBuffer,
                writeType: finalWriteType
            })
            that.markTransferBytes(tempBuffer.byteLength)
            if (count > 1) {
                await sleep(that.getWriteIntervalSec())
            }
        }
    }

    // 获取buffer,二进制数据
    getBuffer(templateStr) {
        let buffer = gbk.strToGBKByte(templateStr);
        return buffer
    }

    // 连接成功后设置 MTU（安卓/鸿蒙有效）；失败不阻断打印
    setBLEMTU(deviceId) {
        const that = this
        return new Promise((resolve) => {
            if (!deviceId || that._osName === 'ios') {
                resolve(false)
                return
            }
            const cfgMtu = convertNumber(that.getPrintConfig().mtu)
            // 优先用界面配置；鸿蒙过大易乱码，未配置时回退 20
            let requestMtu = cfgMtu || that._mtu || 23
            if (that._isHarmonyOS && !cfgMtu) {
                requestMtu = 20
            }
            requestMtu = Math.min(512, Math.max(20, Math.round(requestMtu)))
            that._mtu = requestMtu
            uni.setBLEMTU({
                deviceId,
                mtu: requestMtu,
                success(res) {
                    that.log('setBLEMTU-success======>', res)
                    const mtu = Number(res?.mtu)
                    if (!isNaN(mtu) && mtu > 0) {
                        that._negotiatedMtu = mtu
                    } else if (that._isHarmonyOS) {
                        that._negotiatedMtu = Math.min(requestMtu, 20)
                    } else {
                        that._negotiatedMtu = requestMtu
                    }
                    resolve(true)
                },
                fail(res) {
                    that.log('setBLEMTU-fail======>', res)
                    that._negotiatedMtu = that._isHarmonyOS ? 20 : 0
                    resolve(false)
                }
            })
        })
    }

    // 向打印机设备写入二进制数据（失败重试，避免静默丢包导致“打一下就停”）
    writeBLECharacteristicValue(options) {
        const that = this
        const maxRetry = that.getMaxPacketRetry()
        const doWrite = (writeType, retriedType, retryCount) => new Promise((resolve, reject) => {
            try {
                that.ensurePrintNotAborted()
            } catch (abortErr) {
                reject(abortErr)
                return
            }
            const {
                deviceId,
                serviceId,
                characteristicId,
                buffer
            } = options
            const writeOpts = {
                deviceId,
                serviceId,
                characteristicId,
                value: buffer,
                success(res) {
                    resolve(true)
                },
                fail(res) {
                    that.log('writeBLECharacteristicValue-fail======>', res, {
                        writeType,
                        retryCount,
                        byteLength: buffer?.byteLength
                    })
                    // 先尝试切换 write / writeNoResponse
                    if (!retriedType && writeType) {
                        const altType = writeType === 'writeNoResponse' ? 'write' : 'writeNoResponse'
                        doWrite(altType, true, retryCount).then(resolve).catch(reject)
                        return
                    }
                    // 再按次数重试（鸿蒙常见 10008 拥塞）；开启递进时同步抬升间隔
                    if (retryCount < maxRetry) {
                        const cfg = that.getPrintConfig()
                        if (cfg.enableRecursivePrint) {
                            that.progressiveBumpPrintConfig()
                        }
                        const delay = that.getRetryIntervalSec()
                        sleep(delay).then(() => {
                            doWrite(writeType, retriedType, retryCount + 1).then(resolve).catch(reject)
                        })
                        return
                    }
                    reject(new Error(formatBluetoothError(res, '蓝牙写入失败')))
                }
            }
            if (writeType) {
                writeOpts.writeType = writeType
            }
            uni.writeBLECharacteristicValue(writeOpts)
        })
        return doWrite(options.writeType, false, 0)
    }
}
