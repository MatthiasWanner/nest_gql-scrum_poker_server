import { Module } from '@nestjs/common';
import { UuidService } from './uuid.service';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') || 3600,
        },
      }),
    }),
  ],
  providers: [UuidService, AuthService, AuthResolver],
  exports: [UuidService, AuthService],
})
export class AuthModule {}
