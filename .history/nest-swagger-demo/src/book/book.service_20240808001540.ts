import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { SuccessModel, ErrorModel, BasePageModel } from '../shared/model/base.model'
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
    return data || new BadRequestException('创建书籍信息失败');
  }

  // 查询列表
  findAll() {
    return this.bookRepository.find({
      where: {
        state: true,
      },
    });
  }

  findOne(id: number) {
    return this.bookRepository.findOne({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) throw new BadRequestException('书籍不存在或者已删除');

    const newPermission = this.bookRepository.merge(book, updateBookDto);
    await this.bookRepository.save(newPermission);
    return true;
  }

  async remove(id: number) {
    const book = await this.bookRepository.findOne({
      where: { id },
    });
    if (!book) throw new BadRequestException('书籍不存在或者已删除');

    await this.bookRepository.remove(book);
    return true;
  }
}
