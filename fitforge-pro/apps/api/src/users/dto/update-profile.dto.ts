import {
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsDate,
  IsEnum,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Gender, FitnessGoal, FitnessLevel } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Enter a valid 10-digit Indian mobile number',
  })
  phone?: string;

  @ApiPropertyOptional({ example: '1995-08-15' })
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  @IsDate()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: 'Flat 402, Sunset Heights' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ example: 'Mumbai' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: 'Sarah Connor' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyContactName?: string;

  @ApiPropertyOptional({ example: '9876543211' })
  @IsOptional()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Enter a valid 10-digit emergency contact phone number',
  })
  emergencyContactPhone?: string;

  @ApiPropertyOptional({ example: 175.5 })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(250)
  heightCm?: number;

  @ApiPropertyOptional({ example: 72.5 })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  weightKg?: number;

  @ApiPropertyOptional({ enum: FitnessGoal })
  @IsOptional()
  @IsEnum(FitnessGoal)
  fitnessGoal?: FitnessGoal;

  @ApiPropertyOptional({ enum: FitnessLevel })
  @IsOptional()
  @IsEnum(FitnessLevel)
  fitnessLevel?: FitnessLevel;
}
