import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@ApiTags('书籍')
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @ApiOperation({ summary: '创建书籍' })
  @ApiResponse({ status: 200, description: '创建书籍' })
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Get()
  @ApiOperation({ summary: '获取书籍列表' })
  @ApiResponse({ status: 200, description: '获取书籍列表' })
  findAll() {
    return this.bookService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取书籍详情' })
  @ApiResponse({ status: 200, description: '获取书籍详情' })
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新书籍' })
  @ApiResponse({ status: 200, description: '更新书籍' })
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(+id, updateBookDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除书籍' })
  @ApiResponse({ status: 200, description: '删除书籍' })
  remove(@Param('id') id: string) {
    return this.bookService.remove(+id);
  }
}
