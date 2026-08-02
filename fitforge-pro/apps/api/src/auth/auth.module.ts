import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { EmailService } from '../services/email.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: config.get<string>('jwt.accessExpiresIn', '15m') as any,
          issuer: 'fitforgepro',
          audience: 'fitforgepro-web',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, JwtRefreshStrategy, EmailService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
