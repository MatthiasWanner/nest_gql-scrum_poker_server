export default () => ({
  port: parseInt(process.env.PORT, 10) || 9000,
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: +process.env.REDIS_PORT || 6379,
  cookiesConfig: {
    maxAge: 3_600_000,
    httpOnly: true,
    secure: true,
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
});
