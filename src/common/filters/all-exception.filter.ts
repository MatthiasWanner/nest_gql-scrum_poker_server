import { Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown) {
    return exception;
  }
}
