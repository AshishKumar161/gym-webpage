import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Ip,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GoogleAuthGuard } from '../common/guards/google-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Register ─────────────────────────────────────────────────────────────
  @Post('register')
  @Public()
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User registered successfully. Verification email sent.' })
  @ApiResponse({ status: 409, description: 'Email or phone already registered' })
  async register(
    @Body() dto: RegisterDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto, ip, userAgent);
    this.setAuthCookies(res, result.tokens);
    return {
      message: 'Account created successfully. Please check your email to verify your account.',
      data: result.user,
    };
  }

  // ─── Login ────────────────────────────────────────────────────────────────
  @Post('login')
  @Public()
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Account locked due to too many failed attempts' })
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto, ip, userAgent);
    this.setAuthCookies(res, result.tokens);
    return {
      message: 'Login successful',
      data: result.user,
    };
  }

  // ─── Logout ───────────────────────────────────────────────────────────────
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  async logout(
    @CurrentUser('id') userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    await this.authService.logout(userId, refreshToken);
    this.clearAuthCookies(res);
    return { message: 'Logged out successfully' };
  }

  // ─── Refresh Tokens ───────────────────────────────────────────────────────
  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    const result = await this.authService.refreshTokens(refreshToken, ip);
    this.setAuthCookies(res, result.tokens);
    return {
      message: 'Tokens refreshed',
      data: result.user,
    };
  }

  // ─── Forgot Password ──────────────────────────────────────────────────────
  @Post('forgot-password')
  @Public()
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return {
      message:
        'If this email is registered, you will receive a password reset link within 5 minutes.',
    };
  }

  // ─── Reset Password ───────────────────────────────────────────────────────
  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return { message: 'Password reset successfully. You can now login.' };
  }

  // ─── Verify Email ─────────────────────────────────────────────────────────
  @Get('verify-email')
  @Public()
  @ApiOperation({ summary: 'Verify email address using token from email link' })
  async verifyEmail(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.query.token as string;
    await this.authService.verifyEmail(token);
    const frontendUrl = this.configService.get<string>('frontendUrl');
    res.redirect(`${frontendUrl}/auth/login?verified=true`);
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────
  @Get('google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  googleAuth() {
    // Guard handles redirect
  }

  @Get('google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(
    @Req() req: Request & { user: any },
    @Res() res: Response,
    @Ip() ip: string,
  ) {
    const result = await this.authService.googleLogin(req.user, ip);
    this.setAuthCookies(res, result.tokens);
    const frontendUrl = this.configService.get<string>('frontendUrl');
    const role = result.user.role.toLowerCase();
    res.redirect(`${frontendUrl}/dashboard/${role}`);
  }

  // ─── Me ───────────────────────────────────────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current authenticated user' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const secure = this.configService.get<boolean>('cookie.secure', false);
    const domain = this.configService.get<string>('cookie.domain', 'localhost');
    const sameSite = this.configService.get<'strict' | 'lax' | 'none'>('cookie.sameSite', 'lax');

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      domain,
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      domain,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth',
    });
  }

  private clearAuthCookies(res: Response) {
    const domain = this.configService.get<string>('cookie.domain', 'localhost');
    res.clearCookie('accessToken', { domain, path: '/' });
    res.clearCookie('refreshToken', { domain, path: '/api/v1/auth' });
  }
}
