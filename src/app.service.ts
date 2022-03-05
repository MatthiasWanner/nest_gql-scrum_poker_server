import { Injectable } from '@nestjs/common';
import { Message } from './models/app.models';

@Injectable()
export class AppService {
  getHello(): Message {
    return { message: 'Hello world!' };
  }
}
