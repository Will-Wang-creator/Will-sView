import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    return { service: "Will'sView API", status: 'ok' };
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
