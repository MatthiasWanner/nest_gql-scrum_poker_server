import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum JWTDURATION {
  ONEHOUR = '1h',
  HALFDAY = '12h',
  ONEDAY = '24h',
  ONEWEEK = '1w',
}

class EnvironmentVariables {
  @IsInt()
  PORT: number;

  @IsInt()
  REDIS_PORT: number;

  @IsString()
  REDIS_HOST: string;

  @IsInt()
  @Min(3600)
  CACHE_TTL: number;

  @IsInt()
  @Min(100)
  @Max(1000)
  MAX_ITEM_IN_CACHE: number;

  @IsString()
  JWT_SECRET: string;

  @IsEnum(JWTDURATION)
  JWT_EXPIRES_IN: JWTDURATION;

  @IsString()
  CORS_ORIGIN: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
