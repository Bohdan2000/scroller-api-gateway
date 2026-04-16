import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email: string;
  sessionId: string;
  jti: string;
}

/**
 * Validates the access token signature and expiry.
 * The gateway does NOT check session liveness — that is enforced by the
 * identity service on sensitive operations. The gateway's role is to ensure
 * the token is structurally valid before routing the request downstream.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret', 'change-me'),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
