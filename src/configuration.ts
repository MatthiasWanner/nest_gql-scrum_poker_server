export default () => ({
  port: process.env.PORT,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  cookiesConfig: {
    maxAge: 3_600_000,
    httpOnly: true,
    secure: true,
  },
  corsOrigin: process.env.CORS_ORIGIN,
});
