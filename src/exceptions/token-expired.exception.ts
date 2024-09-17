import { BadRequestException } from '@nestjs/common';

export class TokenExpiredException extends BadRequestException {
  email: string;

  constructor(message: string, email: string) {
    super(message);
    this.email = email;
  }
}
