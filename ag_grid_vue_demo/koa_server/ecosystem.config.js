/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-12-04 08:47:51
 * @LastEditTime: 2024-07-25 21:29:38
 * @Description:
 */
module.exports = {
    apps: [
        {
            name: 'koa_server', // 进程名称
            port: '3002', // 启动端口
            // exec_mode: 'cluster', // 开启集群模式，多线程模式
            // instances: 'max', // 集群实例数
            script: 'bin/www', // 执行文件
            autorestart: false, // 程序崩溃后自动重启
        },
    ],
}
