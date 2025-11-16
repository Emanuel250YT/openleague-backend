import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { UploadService } from './upload.service.js';

@Controller('data')
export class DataController {
  private readonly logger = new Logger(DataController.name);

  constructor(private readonly uploadService: UploadService) { }

  /**
   * Public endpoint to access files by UUID
   * This endpoint does not require authentication
   */
  @Get(':uuid')
  async getPublicFile(
    @Param('uuid') uuid: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log(`Accessing public file: ${uuid}`);

      // Download the file from Arka CDN
      const fileBuffer = await this.uploadService.downloadFile(uuid);

      // Get file info to set proper headers
      const publicUrl = this.uploadService.getPublicUrl(uuid);

      // Set appropriate headers
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Content-Length', fileBuffer.length);

      // Send the file
      res.send(fileBuffer);
    } catch (error) {
      this.logger.error('Get public file error:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('File not found');
    }
  }
}
