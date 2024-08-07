/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2024-08-07 18:01:15
 * @LastEditTime: 2024-08-07 20:09:31
 * @Description:
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  Entity,
} from 'typeorm';
import { TimestampTransformer } from '../../shared/transformer/timestamp.transformer';

@Entity()
export class Book {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
    comment: 'id',
    unsigned: true,
  })
  id: number;

  @ApiProperty()
  @Column({
    type: 'varchar',
    length: 50,
    comment: '书籍名',
  })
  name: string;

  @ApiProperty()
  @Column({
    type: 'varchar',
    length: 50,
    comment: '作者',
  })
  author: string;

  @ApiProperty()
  @Column({
    type: 'text',
    nullable: true,
    name: 'remark',
    comment: '书籍描述',
  })
  description: string | null;

  @ApiProperty()
  @Column({
    type: 'boolean',
    default: true,
    comment: '禁用/开启',
  })
  state: boolean;

  @ApiProperty()
  @CreateDateColumn({
    name: 'created_time',
    comment: '创建时间',
    default: () => 'CURRENT_TIMESTAMP(6)',
    transformer: new TimestampTransformer(),
  })
  createdTime: Date;

  @ApiProperty()
  @UpdateDateColumn({
    name: 'update_time',
    comment: '修改时间',
    default: () => 'CURRENT_TIMESTAMP(6)',
    transformer: new TimestampTransformer(),
    select: true,
  })
  updatedTime: Date;

  @BeforeInsert()
  createTimeHooks() {
    this.createdTime = new Date();
    this.updatedTime = new Date();
  }

  @BeforeUpdate()
  updateTimeHooks() {
    this.updatedTime = new Date();
  }
}
