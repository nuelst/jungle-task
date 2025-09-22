import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { validate } from './config/config.validation';
import configuration from './config/configuration';
import { GatewayModule } from './gateway/gateway.module';
import { WebSocketController } from './websocket.controller';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  @Get()
  root() {
    return {
      message: 'Jungle Gaming API Gateway',
      version: '1.0.0',
      docs: '/api/docs'
    };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get('app.throttler.ttl') || 1000,
            limit: configService.get('app.throttler.limit') || 10,
          },
        ],
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    GatewayModule,
  ],
  controllers: [AppController, WebSocketController],
})
export class AppModule { }

