import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProxyService } from '../services/proxy.service';

@ApiTags('Internal')
@Controller('internal')
export class InternalController {
  constructor(private readonly proxyService: ProxyService) { }

  @Post('notifications/websocket')
  @ApiOperation({
    summary: 'Send WebSocket notification',
    description: 'Internal endpoint to trigger WebSocket notifications'
  })
  async sendWebSocketNotification(@Body() data: any): Promise<{ message: string }> {
    console.log('WebSocket notification received:', data);
    return this.proxyService.sendWebSocketNotification(data);
  }
}
