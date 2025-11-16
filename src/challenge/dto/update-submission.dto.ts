import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { SubmissionStatus } from '@prisma/client';

export class UpdateSubmissionDto {
  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}
