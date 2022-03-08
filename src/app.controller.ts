import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get('graphql/subscriptions')
  getWsIde(@Res() res: Response) {
    res.sendFile('graphiql-over-ws.html', { root: `${__dirname}/../src` });
  }
}
