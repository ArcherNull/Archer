/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-08-07 17:49:55
 * @LastEditTime: 2024-08-07 20:20:22
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
    `nest-swagger-demo is running at http://127.0.0.1:${PORT}; swagger Doc running at http://127.0.0.1:${PORT}/api/swagger; knife4j Doc running at http://127.0.0.1:${PORT}/doc.html;`,
  );
}
bootstrap();
