import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { SocialClient } from '../../clients/social.client';

@ApiTags('profiles')
@ApiBearerAuth('access-token')
@Controller('me')
export class ProfilesController {
  constructor(private readonly social: SocialClient) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get own profile' })
  getMyProfile(@Req() req: FastifyRequest & { requestId: string }): Promise<unknown> {
    return this.social.getMyProfile(this.ctx(req));
  }

  @Post('profile/avatar/upload-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get presigned S3 URL for avatar upload' })
  getAvatarUploadUrl(
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.getAvatarUploadUrl(body, this.ctx(req));
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upsert own profile' })
  upsertProfile(
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.upsertProfile(body, this.ctx(req));
  }

  @Get('onboarding')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get onboarding status' })
  getOnboardingStatus(@Req() req: FastifyRequest & { requestId: string }): Promise<unknown> {
    return this.social.getOnboardingStatus(this.ctx(req));
  }

  @Patch('onboarding/step1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Onboarding step 1 — fill in profile info' })
  completeStep1(
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.completeOnboardingStep1(body, this.ctx(req));
  }

  @Post('onboarding/step2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Onboarding step 2 — choose topics' })
  completeStep2(
    @Body() body: unknown,
    @Req() req: FastifyRequest & { requestId: string },
  ): Promise<unknown> {
    return this.social.completeOnboardingStep2(body, this.ctx(req));
  }

  private ctx(req: FastifyRequest & { requestId: string }) {
    return {
      requestId: req.requestId,
      authorization: req.headers.authorization,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
