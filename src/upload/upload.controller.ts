/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseFilePipe,
  MaxFileSizeValidator,
  BadRequestException,
  Logger,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadService } from './upload.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { UploadFileDto, UploadPlainDto } from './dto/index.js';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) { }

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100MB max
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @GetUser('id') userId: string,
    @Body() uploadFileDto: UploadFileDto,
  ) {
    try {
      this.logger.log(`User ${userId} uploading file: ${file.originalname}`);

      const result = await this.uploadService.uploadFile(file, userId, {
        description: uploadFileDto.description,
        compress: uploadFileDto.compress,
        enableDashStreaming: uploadFileDto.enableDashStreaming,
        ttl: uploadFileDto.ttl,
      });

      return {
        success: true,
        message: 'File uploaded successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Upload error:', error);
      throw new BadRequestException(
        error.message || 'Failed to upload file',
      );
    }
  }

  @Post('plain')
  async uploadPlainData(
    @GetUser('id') userId: string,
    @Body() uploadPlainDto: UploadPlainDto,
  ) {
    try {
      this.logger.log(`User ${userId} uploading plain data: ${uploadPlainDto.filename}`);

      const result = await this.uploadService.uploadPlainData(
        uploadPlainDto.data,
        uploadPlainDto.filename,
        userId,
        uploadPlainDto.description,
      );

      return {
        success: true,
        message: 'Plain data uploaded successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Upload plain data error:', error);
      throw new BadRequestException(
        error.message || 'Failed to upload plain data',
      );
    }
  }

  @Get()
  async listFiles(@GetUser('id') userId: string) {
    try {
      const files = await this.uploadService.listUserFiles(userId);

      return {
        success: true,
        data: files,
      };
    } catch (error) {
      this.logger.error('List files error:', error);
      throw new BadRequestException(
        error.message || 'Failed to list files',
      );
    }
  }

  @Get(':id')
  async getFile(
    @Param('id') fileId: string,
    @GetUser('id') userId: string,
  ) {
    try {
      const file = await this.uploadService.getFile(fileId, userId);

      return {
        success: true,
        data: file,
      };
    } catch (error) {
      this.logger.error('Get file error:', error);
      throw new BadRequestException(
        error.message || 'Failed to get file',
      );
    }
  }

  @Get(':id/text')
  async getTextContent(
    @Param('id') fileId: string,
    @GetUser('id') userId: string,
  ) {
    try {
      const content = await this.uploadService.getTextContent(fileId, userId);

      return {
        success: true,
        data: content,
      };
    } catch (error) {
      this.logger.error('Get text content error:', error);
      throw new BadRequestException(
        error.message || 'Failed to get text content',
      );
    }
  }

  @Get(':id/json')
  async getJsonContent(
    @Param('id') fileId: string,
    @GetUser('id') userId: string,
  ) {
    try {
      const content = await this.uploadService.getJsonContent(fileId, userId);

      return {
        success: true,
        data: content,
      };
    } catch (error) {
      this.logger.error('Get JSON content error:', error);
      throw new BadRequestException(
        error.message || 'Failed to get JSON content',
      );
    }
  }

  @Get(':id/status')
  async getFileStatus(
    @Param('id') fileId: string,
    @GetUser('id') userId: string,
  ) {
    try {
      const status = await this.uploadService.getFileStatus(fileId, userId);

      return {
        success: true,
        data: status,
      };
    } catch (error) {
      this.logger.error('Get file status error:', error);
      throw new BadRequestException(
        error.message || 'Failed to get file status',
      );
    }
  }

  @Delete(':id')
  async deleteFile(@Param('id') fileId: string, @GetUser('id') userId: string) {
    try {
      const result = await this.uploadService.deleteFile(fileId, userId);

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      this.logger.error('Delete file error:', error);
      throw new BadRequestException(
        error.message || 'Failed to delete file',
      );
    }
  }
}
