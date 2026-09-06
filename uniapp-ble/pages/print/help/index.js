/**
 * 蓝牙操作说明 / 底部提示文案
 */

/** 主页面底部提示 */
export const ALERT_TEXT_LIST = [
    '1、若未打印，请重连蓝牙打印机',
    '2、打印机设备处于休眠状态时，第一次连接存在连接不上的情况，需要重新连接',
    '3、当前打印只适合低功耗蓝牙打印机，例如芝柯 CC3 / K319，汉印 HM-A300 / HM-A300L 等手持蓝牙打印机',
]

/** 调试页信号强度常识 */
export const SIGNAL_TIP_LIST = [
    '-50 至 -60 dBm：极强（贴着基站，满格）',
    '-60 至 -70 dBm：很强（通话上网流畅）',
    '-70 至 -80 dBm：较好（日常使用没问题）',
    '-80 至 -90 dBm：一般（边缘区域，可能掉线）',
    '-90 至 -100 dBm：较弱（接近无信号边缘）',
    '-100 以下：极弱（基本无法连接）',
]

/** 权限 / 配对相关说明 */
export const HELP_TIPS = {
    bluetoothAuth: '需要获取您的蓝牙模块，用于连接蓝牙打印机',
    privacy: '请先同意隐私协议后再使用蓝牙',
    reconnect: '若连接失败，可尝试重启蓝牙模块或重新搜索设备',
    supportedDevices: '支持机型：汉印 HM-A300 / HM-A300L，芝柯 CC3 / K319',
}

export default {
    ALERT_TEXT_LIST,
    SIGNAL_TIP_LIST,
    HELP_TIPS,
}
