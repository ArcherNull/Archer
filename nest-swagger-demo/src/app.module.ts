/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-08-07 17:49:55
 * @LastEditTime: 2024-08-07 19:38:29
 * @Description:
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModule } from './book/book.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // 连接数据库
      type: 'mysql', // 数据库类型
      host: '127.0.0.1', // 数据库ip地址
      port: 3306, // 端口
      username: 'root', // 登录名
      password: 'chenRoot12345', // 数据库名称
      database: 'nest_swagger_db', // 数据库名
      logging: true,
      // sql最大执行耗时ms
      maxQueryExecutionTime: 10,
      retryDelay: 500, // 重试连接数据库间隔
      retryAttempts: 2, // 允许重连次数
      // timezone: '+08:00', // 服务器上配置的时区 Z
      timezone: '+08:00',
      // entities: [__dirname + '/**/*.entity{.ts,.js}'], // 扫描本项目中.entity.ts或者.entity.js的文件, mac 系统支持这种
      autoLoadEntities: true, // 自动加载实体 // windows 系统支持这种
      synchronize: true, // 定义数据库表结构与实体类字段同步(这里一旦数据库少了字段就会自动加入,根据需要来使用)
    }),
    BookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
