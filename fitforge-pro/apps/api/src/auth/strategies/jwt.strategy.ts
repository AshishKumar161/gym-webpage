import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      // Extract from Authorization header OR cookie
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.accessToken,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret')!,
      issuer: 'fitforgepro',
      audience: 'fitforgepro-web',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.authService.validateUser(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    if (user.isLocked) {
      throw new UnauthorizedException('Account is locked');
    }

    return user;
  }
}
