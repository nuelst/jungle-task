import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GatewayModule } from '../gateway/gateway.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('app.jwt.secret'),
        signOptions: { expiresIn: configService.get('app.jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
    GatewayModule,
  ],
  controllers: [AuthController],
})
export class AuthModule { }

