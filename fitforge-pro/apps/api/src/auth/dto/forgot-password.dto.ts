import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'Enter a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;
}
