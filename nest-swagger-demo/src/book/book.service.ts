import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { SuccessModel, ErrorModel, SuccessPageModel } from '../shared/model/base.model'
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book) private readonly bookRepository: Repository<Book>,
  ) { }

  async create(createBookDto: CreateBookDto) {
    const newBook = this.bookRepository.create(createBookDto);
    const data = await this.bookRepository.save(newBook);
    return data ? new SuccessModel(data) : new BadRequestException('创建书籍信息失败');
  }

  // 查询列表
  async findAll() {
    const [data, total] = await this.bookRepository.findAndCount({
      where: {
        state: true,
      },
    });

    return new SuccessPageModel({
      total,
      data,
      currentPage: 1,
      pageSize: 10
    })
  }

  async findOne(id: number) {
    const book = await this.bookRepository.findOne({
      where: {
        id,
      },
    });
    return new SuccessModel(book) || new BadRequestException('获取书籍信息失败');
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) throw new BadRequestException('书籍不存在或者已删除');

    const newPermission = this.bookRepository.merge(book, updateBookDto);
    const updateBook = await this.bookRepository.save(newPermission);
    return updateBook ? new SuccessModel('更新成功') : new BadRequestException('更新失败');
  }

  async remove(id: number) {
    const book = await this.bookRepository.findOne({
      where: { id },
    });
    if (!book) throw new BadRequestException('书籍不存在或者已删除');

    const bool = await this.bookRepository.remove(book);
    console.log('bool', bool)
    return bool ? new SuccessModel('删除成功') : new BadRequestException('删除失败');
  }
}
