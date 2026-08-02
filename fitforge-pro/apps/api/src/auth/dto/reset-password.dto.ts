import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'uuid-token-from-email' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewPass@456', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/[A-Z]/, { message: 'Must contain at least one uppercase letter' })
  @Matches(/[0-9]/, { message: 'Must contain at least one number' })
  @Matches(/[^a-zA-Z0-9]/, { message: 'Must contain at least one special character' })
  password: string;
}
