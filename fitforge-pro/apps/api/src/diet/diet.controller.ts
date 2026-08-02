import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DietService } from './diet.service';

@ApiTags('Diet')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('diet')
export class DietController {
  constructor(private readonly dietService: DietService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string, @Query() query: Record<string, string>) {
    return this.dietService.findAll(userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.dietService.findOne(id, userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: any) {
    return this.dietService.create(userId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: any) {
    return this.dietService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.dietService.remove(id, userId);
  }
}
