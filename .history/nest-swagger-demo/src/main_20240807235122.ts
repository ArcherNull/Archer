/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-08-07 17:49:55
 * @LastEditTime: 2024-08-07 23:50:27
 * @Description:
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { knife4jSetup } from 'nest-knife4j';

const PORT = 3000;
const NAME = 'nest-swagger-demo';
const VERSION = '1.0.0';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'Authorization',
    description: 'Enter JWT token',
    in: 'header',
  }, 'Authorization')
  .addGlobalParameters({
    name: 'X-Lang',
    in: 'header',
    description: '国际化语言，英语: enUs; 中文简体: zhCN; 中文繁体: zhTW;',
    example: 'zhCN',
    required: true
  }, {
    name: 'X-Version',
    in: 'header',
    description: '版本号控制， 1 ,2 ',
    example: '1',
    required: true
  })
    .setTitle(NAME)
    .setDescription(`${NAME}-${VERSION} API description`)
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/api/swagger', app, document);
  knife4jSetup(app, [
    {
      name: NAME,
      url: `/api/swagger-json`,
      swaggerVersion: VERSION,
      location: `/api/swagger-json`,
    },
  ]);

  await app.listen(PORT);

  console.log(
    `nest-swagger-demo is running at http://127.0.0.1:${PORT}; 
     swagger Doc running at http://127.0.0.1:${PORT}/api/swagger; 
     knife4j Doc running at http://127.0.0.1:${PORT}/doc.html;`,
  );
}
bootstrap();
