import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateSubmissionDto {
  @IsString()
  challengeId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  arkaFileId: string; // ID del video subido a Arka CDN

  @IsString()
  videoUrl: string; // URL pública del video

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
