<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-06-05 09:56:16
 * @LastEditTime: 2024-06-05 10:00:46
 * @Description:
-->

进程配置面板

请求并发数
请求出错处理，遇到请求出错，跳过/中断请求
请求结果： 请求数据/导出数据文件

请求过程中： 
获取过程中请求数据

请求结束后： 
获取最终请求数据

状态有：
config.processing
config.success
config.fail

request.processing
request.success
request.fail

exportExcel.processing
exportExcel.success
exportExcel.fail

生命周期：
created:

mounted:

beforeDestroy:


子线程向主线程通信响应结果约束

前端导出只有允许存在一个进程，并且不同界面的表格数据会中断该进程




