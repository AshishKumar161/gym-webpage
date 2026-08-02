import {
  IsEmail,
  IsString,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'Enter a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Enter a valid 10-digit Indian mobile number',
  })
  phone: string;

  @ApiProperty({ example: 'SecurePass@123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128)
  @Matches(/[A-Z]/, { message: 'Must contain at least one uppercase letter' })
  @Matches(/[0-9]/, { message: 'Must contain at least one number' })
  @Matches(/[^a-zA-Z0-9]/, {
    message: 'Must contain at least one special character',
  })
  password: string;

  @ApiPropertyOptional({ example: 'JOHN1A2B' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  referralCode?: string;

  @ApiPropertyOptional({ example: 'pro' })
  @IsOptional()
  @IsString()
  plan?: string;
}
