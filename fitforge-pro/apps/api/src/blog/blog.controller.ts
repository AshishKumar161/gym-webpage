import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BlogService } from './blog.service';

@ApiTags('Blog')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string, @Query() query: Record<string, string>) {
    return this.blogService.findAll(userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.blogService.findOne(id, userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: any) {
    return this.blogService.create(userId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: any) {
    return this.blogService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.blogService.remove(id, userId);
  }
}
