/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-08-07 18:01:15
 * @LastEditTime: 2024-08-07 19:44:20
 * @Description:
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { Book } from './entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book])],
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
