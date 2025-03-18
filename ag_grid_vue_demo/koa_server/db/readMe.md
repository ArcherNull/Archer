<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-06-27 16:37:38
 * @LastEditTime: 2024-07-09 19:27:13
 * @Description: 
-->

sequelize 官方文档： https://www.sequelize.cn/

http://activate.navicat.com:3002/v1/admin/login

http://127.0.0.1:3002/v1/admin/login

http://127.0.0.1:3002/html/index.html

http://www.overflight.cn/v1/admin/login

http://www.overflight.cn/html/index.html

http://127.0.0.1:3002/v1/api/userTableConfig/list

http://api.overflight.cn/v1/admin/login

{
    "userName": "faker",
    "password": "123456"
}

{
    "dbName": "用户表",
    "startTime": "2020-01-11 00:00:00",
    "endTime": "2023-09-11 17:14:57"
}


Authorization

Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6ImZha2VyMTIzIiwicGhvbmVOdW1iZXIiOiIxNjc1Mzg2NTY3MiIsImlkIjoxNiwiaWF0IjoxNzIwNTI0MzUyLCJleHAiOjE3MjA2MTA3NTJ9.DKuohC9AhDoX2NApB276mQb_V3FvVoSglXuFmPXgRiE

/v1/api/user/list
{
    "pageNum": 1,
    "pageSize": 10
}

/v1/api/user/create
{
    "pageNum": 1,
    "pageSize": 10
}

/v1/api/user/edit

/v1/api/upload


传参方式

params  
  ctx.request.query
  ctx.request.querystring  application/json  形如/v1/api/user/test?id=51

data
  ctx.request.body  application/json  from-data  x-www-form-urlencoded


迁移数据库
npx sequelize-cli init
npx sequelize-cli db:migrate --env=development

npx sequelize-cli db:migrate --name 20240528041949-create-order.js

npx sequelize-cli db:migrate --name 20240529021327-create-order.js

撤销迁移文件，撤销最近的迁移文件
npx sequelize-cli db:migrate:undo
你想撤销特定的迁移文件，可以指定迁移名称：
npx sequelize-cli db:migrate:undo --name "20210101120000-create-users.js"
如果你想撤销多个迁移，可以使用--steps选项
npx sequelize-cli db:migrate:undo --steps 3

创建种子文件
npx sequelize-cli seed:generate --name seedName

例如：
npx sequelize-cli seed:generate --name addOrderSeeds

运行种子文件
运行指定种子文件：npx sequelize-cli db:seed --seed seedName                     
运行所有种子文件：npx sequelize-cli db:seed:all     

例如：npx sequelize-cli db:seed --seed 20230629055202-addUserSeeds.js


撤销种子文件
指定种子文件：npx sequelize-cli db:seed:undo --seed sendName      
撤销所有种子文件：npx sequelize-cli db:seed:undo:all    




### 公共字段
创建时间 createdAt ， 更新时间 updatedAt ， id 自增id

### 一、创建用户表

#### 创建表字段

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


- 命令为 
npx sequelize-cli model:generate --name user --attributes userName:string,userImg:string,userRole:string,userState:bigInt,authState:bigInt,sex:bigInt,realName:string,birthday:date,idCardNo:string,phoneNumber:string,age:bigInt,email:string,province:string,provinceId:bigInt,city:string,cityId:bigInt,area:string,areaId:bigInt,address:string,longitude:decimal,latitude:decimal,password:string,token:string,remark:text,registerFrom:bigInt,userTags:string

添加新字段 registerFrom , userTags

创建新的迁移文件
npx sequelize-cli migration:create --name create-user-add-userTags

执行迁移文件
npx sequelize-cli db:migrate --env=development


### 二、创建计划表

#### 创建表字段

2）计划表plan：计划名称 planName，计划状态 planState，计划类型 planType ，计划标签 planTag ，计划开始执行时间 planStartDoTime ，计划结束执行时间 planEndDoTime，实际开始执行时间 planStartRealDoTime ，实际结束执行时间 planEndRealDoTime， 计划备注 planRemark ，隶属于那个父级计划 planParentId ，创建人createBy，创建人id createById

计划类型：日计划，周计划，月计划，季度计划，年计划
计划标签：生活，学习，健康
计划状态：0-删除；1-新增；2-已完成；3-未完成；4-废弃

npx sequelize-cli model:generate --name plan --attributes planName:string,planState:bigInt,planType:string,planTag:string,planStartDoTime:date,planEndDoTime:date,planStartRealDoTime:date,planEndRealDoTime:date,planRemark:text,planParentId:integer,createBy:string,createById:integer


### 三、创建任务表

3）任务表task ： 任务名称 taskName ，任务状态 taskState，任务类型 taskType ， 任务标签 taskTag , 任务计划开始时间 taskStartTime ，任务计划结束时间 taskEndTime ，任务实际开始时间 taskStartRealDoTime ，任务实际结束时间 taskEndRealDoTime ， 任务备注 taskRemark ，隶属于那个计划 bindPlanId ，创建人createBy，创建人id createById,

隶属于日计划，任务一/任务二
任务类型：紧急，重要，主要，普通
任务标签：生活，学习，健康
任务状态：0-删除；1-新增；2-已完成；3-未完成；4-废弃

npx sequelize-cli model:generate --name task --attributes taskName:string,taskState:bigInt,taskType:string,taskTag:string,taskStartTime:date,taskEndTime:date,taskStartRealDoTime:date,taskEndRealDoTime:date,taskRemark:text,bindPlanId:integer,createBy:string,createById:integer

### 四、创建奖惩表

4）奖惩表reward_punishment： 奖惩名称 rpName ，奖惩状态 rpState ，奖惩类型 rpType ，奖惩标签 rpTag，奖惩备注 rpRemark ，绑定任务 bindTaskId ，绑定计划 bindPlanId, 创建人createBy，创建人id createById,

奖惩状态：0-删除；1-新增；2-已执行；3-未执行；4-废弃
奖惩类型: 奖励 ， 惩罚
奖惩备注： 标注奖励和惩罚的内容

npx sequelize-cli model:generate --name reward_punishment --attributes rpName:string,rpState:bigInt,rpType:string,rpTag:string,rpRemark:text,bindTaskId:integer,bindPlanId:integer,createBy:string,createById:integer

### 五、名言表
5）名言表well_konwn_saying: 名言名称 wksTitle ， 名言状态 wksState ，名言类型 wksType ， 名言标签 wksTag ，  名言中文内容 wksCNContent ，名言英文内容 wksENContent，名言作者 wksAuthor ，名言备注 wksRemark  ，点赞数 wksLikeCount，创建人createBy，创建人id createById,

名言状态 : 0-禁用；1-启用；2-作废；
名言类型： 国内 / 国外
名言标签: 励志，智慧，感悟
被当前用户点赞 ： 0-未点赞 ， 1-点赞

npx sequelize-cli model:generate --name well_konwn_saying --attributes wksTitle:string,wksState:bigInt,wksType:string,wksTag:string,wksCNContent:text,wksENContent:text,wksAuthor:string,wksRemark:text,wksLikeCount:bigInt,createBy:string,createById:integer

### 六、评论表
6）评论表 comment ：评论名称 cName ，评论状态 cState ， 评论类型：cType , 评论内容 cContent ，上传图片 cImgs ，点赞数 cLikeCount ，是否会被当前用户点赞 cIsLike，绑定计划ID bindPlanId ， 绑定任务id bindTaskId , 绑定笔记ID bindNoteId, 创建人createBy，创建人id createById

评论状态：0-删除，1-公开，2-私有
评论类型: 赞同，反对
是否会被当前用户点赞 ： 0-未点赞 ， 1-点赞

npx sequelize-cli model:generate --name comment --attributes cName:string,cState:bigInt,cType:string,cContent:text,cImgs:string,cLikeCount:bigInt,cIsLike:bigInt,bindPlanId:integer,bindTaskId:integer,bindNoteId:integer,createBy:string,createById:integer


### 七、笔记表
7）笔记表note：笔记标题 noteTitle ，笔记附标题noteSubTitle ,  笔记状态 noteState ，笔记类型 noteType ， 笔记标签 noteTag ， 笔记内容 noteContent ，上传图片 noteImgs ，点赞数 nLikeCount, ，是否会被当前用户,  收藏数 nCollectCount, 创建人createBy，创建人id createById

笔记状态：0-删除，1-公开，2-私有
笔记类型：健康，科学，IT，知识类
是否会被当前用户点赞 ： 0-未点赞 ， 1-点赞
是否会被当前用户收藏 ： 0-未收藏 ， 1-收藏

npx sequelize-cli model:generate --name note --attributes noteTitle:string,noteState:bigInt,noteType:string,noteTag:string,noteContent:text,noteImgs:string,nLikeCount:bigInt,nCollectCount:bigInt,createBy:string,createById:integer

### 八、字典表
8）字典表info_dict：字典label : dicLabel, 字典value : dicValue , 字典绑定id  dicBindId , dicState 字典状态 , dicExtraParams 字典额外参数，dicRemark 字典备注,  创建人createBy，创建人id createById

字典状态 : 0-禁用；1-启用；

npx sequelize-cli model:generate --name info_dict --attributes dicLabel:string,dicValue:string,dicBindId:integer,dicState:bigInt,dicExtraParams:json,dicRemark:text,createBy:string,createById:integer

### 九、信息码表
信息码表info_code， 用于verifyCode手机验证码，qrCode码，emailCode验证码等

验证码表 info_code : 信息码分类 icClassify , 信息码内容 icContent , 信息码状态icState , 信息码类型 icType , 信息码再次校验JSON参数 icReValJson  信息码失效时间 icExpiresTime ，信息码备注 icRemark 

信息码状态 0-禁用，1-启用，2-删除
信息码分类 preLogin-预登录校验，isLogin-正登录中，resetPwd-重置密码
信息码类型 qrCode-二维码 ； email - 邮箱 ； phoneNumber - 手机号 ； token-正在登录的token记录
信息码再次校验JSON参数 icReValJson , 用于存放用户id

npx sequelize-cli model:generate --name info_code --attributes icClassify:string,icContent:text,icState:bigInt,icType:string,icReValJson:json,icExpiresTime:date,icRemark:text,createBy:string,createById:integer

### 十、用户配置表
用户表格个性化配置表，用于用户表格自定义配置，每个用户都有自己的个性化设置

- 用户表格个性化配置表 user_table_config： 表格配置JSON configJson , 表格字段JSON fieldJson, 菜单名称 menuName ， 表格类型 type ； userId :  用户id


- 命令为 
npx sequelize-cli model:generate --name user_table_config --attributes  configJson:json,fieldJson:json,menuName:string,type:string,userId:integer

创建新的迁移文件
npx sequelize-cli migration:create --name user_table_config

执行迁移文件
npx sequelize-cli db:migrate --env=development