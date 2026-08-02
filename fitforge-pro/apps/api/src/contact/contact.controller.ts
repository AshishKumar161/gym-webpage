import { Controller, Post, Body, Get, Query, UseGuards, Delete, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Role } from '@prisma/client';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Submit contact inquiry (public)' })
  create(@Body() dto: CreateContactDto) {
    return this.contactService.createInquiry(dto);
  }

  @Get()
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @ApiOperation({ summary: 'List all contact inquiries [Admin]' })
  findAll(@CurrentUser('id') userId: string, @Query() query: Record<string, string>) {
    return this.contactService.findAll(userId, query);
  }

  @Get(':id')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.contactService.findOne(id, userId);
  }

  @Put(':id')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: any) {
    return this.contactService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.contactService.remove(id, userId);
  }
}
