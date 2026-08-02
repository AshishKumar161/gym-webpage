import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ClassesService } from './classes.service';

@ApiTags('Classes')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string, @Query() query: Record<string, string>) {
    return this.classesService.findAll(userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.classesService.findOne(id, userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: any) {
    return this.classesService.create(userId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: any) {
    return this.classesService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.classesService.remove(id, userId);
  }
}
