import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string, @Query() query: Record<string, string>) {
    return this.notificationsService.findAll(userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.findOne(id, userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: any) {
    return this.notificationsService.create(userId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: any) {
    return this.notificationsService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.remove(id, userId);
  }
}
