import { IsString, IsEnum, IsOptional, IsObject, IsInt, Min, IsDateString } from 'class-validator';
import { ChallengeDifficulty } from '@prisma/client';

export class CreateChallengeDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(ChallengeDifficulty)
  difficulty: ChallengeDifficulty;

  @IsOptional()
  @IsInt()
  @Min(1)
  requiredActions?: number = 1;

  @IsOptional()
  @IsObject()
  rewards?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  arkaFileId?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string; // Si no se provee, se calcula automáticamente según dificultad
}
