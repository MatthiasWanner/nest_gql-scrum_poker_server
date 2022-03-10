import { Injectable } from '@nestjs/common';
import { v4 as v4Uuid } from 'uuid';

@Injectable()
export class UuidService {
  private v4: () => string;
  constructor() {
    this.v4 = v4Uuid;
  }

  generateV4(): string {
    return this.v4();
  }
}
