import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ChallengeDifficulty, ChallengeStatus } from '@prisma/client';

export class ChallengeFilterDto {
  @IsOptional()
  @IsEnum(ChallengeStatus)
  status?: ChallengeStatus;

  @IsOptional()
  @IsEnum(ChallengeDifficulty)
  difficulty?: ChallengeDifficulty;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}
