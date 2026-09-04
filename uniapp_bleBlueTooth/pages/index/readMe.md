
文件E:\blqc-project\Archer\uniapp_bleBlueTooth\ble是蓝牙相关的
文件E:\blqc-project\Archer\uniapp_bleBlueTooth\pages\index\index.vue需要实现一个界面，有打印设置模块/设备信息模块/打印模板选择模块/
组件写在E:\blqc-project\Archer\uniapp_bleBlueTooth\pages\index\components

界面样式，蓝牙相关使用，E:\blqc-project\Archer\uniapp_bleBlueTooth\ble\comm\cusBluetooth.js文件的CusBluetoothModuleClass类的使用，可以参考E:\blqc-project\Archer\uniapp_bleBlueTooth\pages\store\index.vue

1、打印设置模块内容如下

打印任务超时时间，输入框，整数，必填，最小值为10，最大值为100，单位为s，默认值为40s（打印任务超时时间初始设置为40s，超出40s则需要中断打印任务）
是否开启递归打印，复选框，默认开启；是否开启递归打印开启时，需要实现递进打印（当打印失败时，需要实现递进操作，当打印任务成功后，需要记录）

各设备的初始配置（进入界面需要判断手机的平台）
展示手机平台
包间隔时间，输入框，整数，必填，默认20ms，单位为ms，最小值为20ms，最大值为300ms；步进值，输入框，整数，必填，默认20ms，单位为ms，最小值为10ms，最大值为100ms
重试间隔时间，输入框，整数，必填，默认50ms，单位为ms，最小值为20ms，最大值为300ms；步进值，输入框，整数，必填，默认30ms，单位为ms，最小值为10ms，最大值为200ms
单包传输失败最大重试次数，输入框，整数，必填，默认2，最小值为0，最大值6

因各平台不一样，初始值不一样
鸿蒙系统， 初始包间隔80ms（间隔步进增加值为20ms），初始重试间隔120ms（间隔步进增加值为30ms），单包传输失败最大重试次数为3
iOS，初始包间隔20ms（间隔步进增加值为20ms），重试间隔50ms（间隔步进增加值为30ms），单包传输失败最大重试次数为2
安卓/其它，初始包间隔20ms（间隔步进增加值为20ms），重试间隔50ms（间隔步进增加值为30ms），单包传输最大重试次数为2


2、设备信息模块内容如下
展示手机蓝牙模块状态，搜索蓝牙设备状态，已搜索蓝牙设备

开启蓝牙并搜索设备按钮（扫码加入设备）

已连接蓝牙设备（取消连接按钮）

已搜索到的蓝牙设备列表，展示8个，可以在容器内上下滚动（有蓝牙名称，信号，连接（如果已经存在已连接蓝牙设备，点击新的设备连接，需要替换已连接蓝牙设备））

3、打印模板选择模块
选择需要打印的模板，数据来源于E:\blqc-project\Archer\uniapp_bleBlueTooth\pages\store\template\cpcl


打印按钮左边需要加入一个取消递归打印按钮（终止所有打印任务）
打印按钮上需要展示打印预计时间（单位s），打印进度(百分比)，数据传输进度(百分比)，打印耗时(单位s)

当打印任务成功后，需要在打印按钮上的进度统计（也就是打印预计时间（单位s），打印进度(百分比)，数据传输进度(百分比)，打印耗时(单位s)）上方展示，系统，包间隔时间，重试间隔时间

文件E:\blqc-project\Archer\uniapp_bleBlueTooth\pages\index\components\PrintSettings.vue中的MTU设置输入框，必填，最小值20，默认值23，单位为字节，最大512字节，步进值，输入框，整数，必填，默认20ms，单位为ms，最小值为10ms，最大值为100ms
鸿蒙，单包传输速率23字节，过大容易乱码
安卓，单包传输速率512字节，默认512字节
IOS，不可设置，系统默认分配

MTU设置需要放在包间隔时间之前


信号强度的常识：
-50 至 -60 dBm：极强（相当于贴着基站，满格信号）。
-60 至 -70 dBm：很强（通话上网非常流畅）。
-70 至 -80 dBm：较好（日常使用没问题）。
-80 至 -90 dBm：一般（边缘区域，可能掉线）。
-90 至 -100 dBm：较弱（基本处于无信号边缘）。
-100 以下：极弱（基本无法连接）。



MTU，单包数据，最小23字节，最大512字节【先按最小的来设置，23字节】
包间时间，每个包的传输间隔，越长，打印时间越慢【先按最长的来测试，80ms是最稳定的，最大设置300ms，最小设置20ms】
重试间隔时间，包传输失败，重试包传输的时间间隔，越长，打印时间越慢【先按最长的来测试，80ms是最稳定的，最大设置300ms，最小设置50ms】


汉印相关SDK：https://www.hprt.com.cn/search_keywork.html?search_key=HM-A300&search_num=21


汉印手持蓝牙打印机使用的CPCL指令与“标准”CPCL指令并非完全一致，存在厂商特定的扩展和实现细节差异。
可以这样理解两者的关系：

基础同源：汉印打印机的CPCL指令集，源于Zebra Technologies为便携式打印机设计的CPCL（Compact Printer Command Language）。因此，大部分基础的CPCL指令（如TEXT、LINE、BOX、BARCODE等）在汉印打印机上是通用的。

存在差异：不同打印机厂商在实现CPCL时，通常会有自己的“方言”。汉印也在标准指令基础上进行了封装、扩展或定制。部分资料也直接称CPCL为“汉印打印机专用的指令集”。

并非100%兼容：不同品牌打印机对CPCL指令的支持程度不同，直接套用其他品牌（如斑马、芝柯）的CPCL指令可能会出现兼容性问题。

参数行为差异：即使是相同的指令，某些参数的行为也可能因厂商而异。例如，有开发者发现“打印份数”这个参数在部分打印机上不生效



portakal：一个“通用打印机语言SDK”，能以统一的API生成CPCL、ZPL、ESC/POS等9种指令。它采用纯TypeScript编写，零依赖。其设计理念是“一套代码，适配所有热敏打印机”，对于追求跨平台和代码复用的项目很有吸引力。
github：https://github.com/productdevbook/portakal
npm install portakal
portakal 的适用场景：当你需要跨多种打印机语言（如同时支持 CPCL 和 ZPL），或需要在 H5 端 生成指令并通过 Web API 打印时，portakal 是一个强大的选择。


CPCL 轻量面单打印；轻量 CPCL 面单。四端蓝牙/局域网；encoding、状态探测、已配对、短队列与 busy；dryRun 免 init。
breao-cpclprint 插件在 uni-app 插件市场的链接是：https://ext.dcloud.net.cn/plugin?id=29241


