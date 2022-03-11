export default () => ({
  port: parseInt(process.env.PORT, 10) || 9000,
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: +process.env.REDIS_PORT || 6379,
});
