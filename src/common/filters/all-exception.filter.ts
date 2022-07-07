import { Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private logger = new Logger();
  catch(exception: HttpException) {
    this.logger.error(exception.message, exception.name);
    return exception;
  }
}
