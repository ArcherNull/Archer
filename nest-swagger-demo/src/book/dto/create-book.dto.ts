/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-08-07 18:01:15
 * @LastEditTime: 2024-08-07 19:16:35
 * @Description:
 */
import { ApiProperty } from '@nestjs/swagger';
import { Length, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateBookDto {
  @ApiProperty({ description: '书名', required: true, example: '书名' })
  @IsNotEmpty({ message: '书名不能为空' })
  @Length(1, 50, {
    message: `用户名长度必须大于$constraint1到$constraint2之间，当前传递的值是$value`,
  })
  name: string;

  @ApiProperty({
    description: '描述',
    required: false,
    example: '描述描述描述描述描述描述',
  })
  @IsNotEmpty({ message: '描述不能为空' })
  @IsOptional()
  description: string;

  @ApiProperty({ description: '作者', required: true, example: 'faker' })
  @IsNotEmpty({ message: '作者不能为空' })
  author: string;
}
