import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Role } from '@prisma/client';
import { memoryStorage } from 'multer';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new Error('Only image files allowed'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  @ApiOperation({ summary: 'Upload profile avatar' })
  uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(userId, file.buffer);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get user fitness stats' })
  getUserStats(@Param('id') userId: string) {
    return this.usersService.getUserStats(userId);
  }

  // ─── Admin endpoints ───────────────────────────────────────────────────
  @Get()
  @Roles(Role.ADMIN, Role.OWNER)
  @ApiOperation({ summary: 'List all users [Admin/Owner]' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('role') role?: Role,
    @Query('status') status?: string,
  ) {
    return this.usersService.findAll({ page: +page, limit: +limit, search, role, status });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  @ApiOperation({ summary: 'Get user by ID [Admin/Owner]' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/activate')
  @Roles(Role.ADMIN, Role.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate/deactivate user [Admin/Owner]' })
  toggleActivation(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.usersService.toggleActivation(id, isActive);
  }

  @Patch(':id/role')
  @Roles(Role.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user role [Owner only]' })
  changeRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.usersService.changeRole(id, role);
  }
}
