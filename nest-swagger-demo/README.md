<!--
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-08-07 17:49:55
 * @LastEditTime: 2024-08-07 20:22:40
 * @Description: 
-->
### nest-swagger-demo
使用 nest-knife4j + @nestjs/swagger 生成接口文档


### 参考文档
 参考文档 ：https://www.kancloud.cn/juukee/nestjs/2708218
 * nest-knife4j: https://github.com/DoveAz/nest-knife4j
 * knife4j官网： http://knife4j.net/

### 安装
···
pnpm install 

pnpm run start

···

### 访问

```
nest-swagger-demo is running at http://127.0.0.1:3000; 

swagger Doc running at http://127.0.0.1:3000/api/swagger; 

knife4j Doc running at http://127.0.0.1:3000/doc.html;
```

### 注意
```
  // 访问 swagger + nest-knife4j ， 访问：http://127.0.0.1:3009/doc.html
  // 如果使用了 @nestjs/serve-static 静态资源服务，则需要加入 exclude: ['/doc/(.*)']，资源访问时就不会打到静态资源文件夹上
      ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client'),
      exclude: ['/doc/(.*)']
    }),
```