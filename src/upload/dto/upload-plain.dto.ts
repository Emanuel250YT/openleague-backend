import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UploadPlainDto {
  @IsNotEmpty()
  data: string | object;

  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsOptional()
  @IsString()
  description?: string;
}
