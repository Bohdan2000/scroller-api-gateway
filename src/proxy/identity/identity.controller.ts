import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { IdentityClient } from '../../clients/identity.client';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('auth')
@Controller()
export class IdentityController {
  constructor(private readonly identity: IdentityClient) {}

  // ─── Public routes ───────────────────────────────────────────────────────────

  @Public()
  @Post('auth/sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new account' })
  signUp(@Body() body: unknown, @Req() req: FastifyRequest & { requestId: string }): Promise<unknown> {
    return this.identity.signUp(body, this.ctx(req));
  }

  @Public()
  @Post('auth/sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  signIn(@Body() body: unknown, @Req() req: FastifyRequest & { requestId: string }): Promise<unknown> {
    return this.identity.signIn(body, this.ctx(req));
  }

  @Public()
  @Post('auth/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() body: unknown, @Req() req: FastifyRequest & { requestId: string }): Promise<unknown> {
    return this.identity.refresh(body, this.ctx(req));
  }

  @Public()
  @Post('auth/oauth/google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with Google' })
  oauthGoogle(@Body() body: unknown, @Req() req: FastifyRequest & { requestId: string }): Promise<unknown> {
    return this.identity.oauthGoogle(body, this.ctx(req));
  }

  @Public()
  @Post('auth/oauth/apple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with Apple' })
  oauthApple(@Body() body: unknown, @Req() req: FastifyRequest & { requestId: string }): Promise<unknown> {
    return this.identity.oauthApple(body, this.ctx(req));
  }

  // ─── Protected routes ────────────────────────────────────────────────────────

  @Post('auth/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Revoke current session' })
  logout(@Body() body: unknown, @Req() req: FastifyRequest & { requestId: string }): Promise<unknown> {
    return this.identity.logout(body, this.ctx(req));
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current authenticated user' })
  getMe(@Req() req: FastifyRequest & { requestId: string }): Promise<unknown> {
    return this.identity.getMe(this.ctx(req));
  }

  // ─── Helper ──────────────────────────────────────────────────────────────────

  private ctx(req: FastifyRequest & { requestId: string }) {
    return {
      requestId: req.requestId,
      authorization: req.headers.authorization,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
