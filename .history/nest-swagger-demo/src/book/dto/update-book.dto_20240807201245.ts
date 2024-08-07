/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-08-07 18:01:15
 * @LastEditTime: 2024-08-07 20:12:44
 * @Description:
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';

export class UpdateBookDto extends PartialType(CreateBookDto) {}
