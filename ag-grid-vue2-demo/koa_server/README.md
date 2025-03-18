<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-04-14 11:22:21
 * @LastEditTime: 2024-07-18 10:28:06
 * @Description: 
-->
# koa_server
该系统并没有怎么用到环境变量，使用的是config.js实现系统配置的

## 准备
### 环境准备
mySql5.7以上 / nodeJs / koa2 / sequelize-cli

### 知识准备
前端相关知识，nodeJs相关知识

## 安装使用
node版本 18.15.0
pnpm  8.6.2
npm  9.8.1

```
cd .\koa_server\

// 清除缓存
pnpm store prune 

// 删除node_modules , 推荐使用remove-node-modules插件
remove-node-module

// 安装依赖
pnpm install 

// 运行项目
pnpm run dev

// pm2运行项目
pnpm run prd

// sequelize 执行命令脚本运行命令
pnpm run db:script

```
启动成功

api访问：http://www.localhost:3002
login api为：http://127.0.0.1:3002/v1/admin/login
```
{
    "userName": "faker",
    "password": "123456"
}
```
```
Authorization

Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6ImZha2VyMTIzIiwicGhvbmVOdW1iZXIiOiIxNTkwODM0OTUxNyIsImlkIjoyMzAxLCJpYXQiOjE3MjEzMTQzNzQsImV4cCI6MTcyMTQwMDc3NH0.1Wkb0cFCCARscyU7zOh54C3_p6ZmMr54jMtA7FzjLu4

```

swagger 访问： http://www.localhost:3002/swagger

静态资源访问： 
http://www.localhost:3002/public/images/1.jpg
http://www.localhost:3002/public/json/1.json
http://www.localhost:3002/public/html/qrCode.html

我们可以将打包好的前端代码放在public中，这样我们就可以通过后端服务访问请求了
http://www.127.0.0.1:3002/public/antd-ag2/index.html

## 本地数据库连接
先创建MySql本地数据库db_test

```
// 执行迁移文件
npx sequelize-cli db:migrate --env=development

```

## sequelize-cli 相关指令
sequelize 官方文档： https://www.sequelize.cn/

### 模型文件执行
例如：创建一个用户表
- 用户表 user：用户名 userName，用户头像 userImg，用户角色 userRole，用户状态 userState，认证状态 authState，性别 sex，真实姓名 realName，身份证号 idCardNo，手机号 phoneNumber，年龄 age，邮箱 email，省 province，市 city，区 area，详细地址 address，经度 longitude，纬度 latitude，密码 password，令牌 token,  备注 remark ， 注册来自 registerFrom ， 用户标签 userTags 

用户状态：0-禁用；1-启用；2-注销
用户实名状态：0-未实名；1-认证中；2-已实名；3-认证失败
用户角色 ： 超级管理员 ， 管理员 ， 普通用户
用户性别，0-未知；1-男；2-女
注册：手机号+密码， 用户名随机，用户头像默认
登录： 手机号+密码； 邮箱+密码
找回密码：手机号+手机验证码；邮箱+手机验证码；
实名认证：用户头像，性别，真实姓名，身份证号，手机号，年龄，邮箱，省，市，区，详细地址，经度，维度
注册来自：0-官网，1-小程序，2-pc管理端
用户标签: 记录用户特征

```
// 执行模型文件创建命令
npx sequelize-cli model:generate --name user --attributes [属性]

例如：
npx sequelize-cli model:generate --name user --attributes userName:string,userImg:string,userRole:string,userState:bigInt,authState:bigInt,sex:bigInt,realName:string,birthday:date,idCardNo:string,phoneNumber:string,age:bigInt,email:string,province:string,provinceId:bigInt,city:string,cityId:bigInt,area:string,areaId:bigInt,address:string,longitude:decimal,latitude:decimal,password:string,token:string,remark:text,registerFrom:bigInt,userTags:string
```


### 迁移文件执行
```
// sequelize-cli初始化，生成models / seeders / migrations
npx sequelize-cli init

// 创建新的迁移文件
npx sequelize-cli migration:create --name create-user-add-userTags

// 执行全部迁移文件， 用于生成对应的models ， 在数据库记录更改，可用于数据库字段回退等操作， --env=development 表示某个环境
npx sequelize-cli db:migrate --env=development

// 执行特定名称迁移文件
npx sequelize-cli db:migrate --name 20240528041949-create-order.js

// 撤销迁移文件，撤销最近的迁移文件
npx sequelize-cli db:migrate:undo

// 你想撤销特定的迁移文件，可以指定迁移名称：
npx sequelize-cli db:migrate:undo --name 20210101120000-create-users.js

// 如果你想撤销多个迁移，可以使用--steps选项
npx sequelize-cli db:migrate:undo --steps 3

```

### 种子文件执行
种子文件，是用于生成假数据，插入在数据库中，当项目流程泡通，则可以很快移除其假数据，一般联合mockjs使用，
插入条数，一般在0-3000条，超出会报错

```
// 创建种子文件
npx sequelize-cli seed:generate --name seedName

// 运行指定种子文件
npx sequelize-cli db:seed --seed seedName
例如：npx sequelize-cli db:seed --seed 20230629055202-addUserSeeds.js

// 运行所有种子文件
npx sequelize-cli db:seed:all  

// 撤销指定种子文件
npx sequelize-cli db:seed:undo --seed sendName   

// 撤销所有种子文件
npx sequelize-cli db:seed:undo:all    

```


## 功能涵盖
jwt / 定时任务 / log4js / 邮箱验证码 / swagger / cors / webscoket创建 / 服务器代理 / mySQL数据库连接 / sequelize / sequelize-cli / mockjs / 扫码登录 

## 邮箱发送

参考文档：https://juejin.cn/post/7081894740370653197

```
  // 邮箱配置
  NODEMAILER_CONFIG: {
    QQ: {
      service: "qq", //类型qq邮箱
      port: 465, //上文获取的port
      secure: true, //上文获取的secure
      auth: {
        user: "779217162@qq.com", // 发送方的邮箱，可以选择你自己的qq邮箱
        pass: "loeerzetkfdabfhi", // 上文获取的stmp授权码
      },
    },
  },

```




