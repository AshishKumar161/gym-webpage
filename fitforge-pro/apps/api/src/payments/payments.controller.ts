import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string, @Query() query: Record<string, string>) {
    return this.paymentsService.findAll(userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.paymentsService.findOne(id, userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: any) {
    return this.paymentsService.create(userId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: any) {
    return this.paymentsService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.paymentsService.remove(id, userId);
  }
}
