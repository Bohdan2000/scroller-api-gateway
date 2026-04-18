export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'change-me',
  },
  services: {
    identityUrl: process.env.IDENTITY_SERVICE_URL ?? 'http://localhost:3001/api/v1',
    socialUrl: process.env.SOCIAL_SERVICE_URL ?? 'http://localhost:3002/api/v1',
    contentUrl: process.env.CONTENT_SERVICE_URL ?? 'http://localhost:3003/api/v1',
  },
  throttle: {
    ttlMs: parseInt(process.env.THROTTLE_TTL_MS ?? '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },
});
