import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArkaCDNService } from './arka-cdn.service.js';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private arkaCDN: ArkaCDNService,
    private configService: ConfigService,
  ) { }

  async onModuleInit() {
    try {
      // Authenticate with Arka CDN using environment credentials
      const email = this.configService.get<string>('ARKA_CDN_EMAIL');
      const password = this.configService.get<string>('ARKA_CDN_PASSWORD');
      const walletAddress = this.configService.get<string>('ARKA_CDN_WALLET');

      if (walletAddress) {
        await this.arkaCDN.loginWithWallet(walletAddress);
        this.logger.log('Authenticated with Arka CDN using wallet');
      } else if (email && password) {
        await this.arkaCDN.login(email, password);
        this.logger.log('Authenticated with Arka CDN using email/password');
      } else {
        this.logger.warn('No Arka CDN credentials found. Authentication required before upload.');
      }
    } catch (error) {
      this.logger.error('Failed to authenticate with Arka CDN:', error);
      throw error;
    }
  }

  /**
   * Upload a file to Arka CDN
   */
  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    options?: {
      description?: string;
      compress?: boolean;
      enableDashStreaming?: boolean;
      ttl?: number;
    },
  ) {
    this.logger.log(
      `Uploading file: ${file.originalname}, size: ${file.size} bytes, type: ${file.mimetype}`,
    );

    const result = await this.arkaCDN.uploadFile(file, options);

    this.logger.log(`File uploaded successfully: ${result.data.fileId}`);
    return result.data;
  }

  /**
   * Upload plain text or JSON data
   */
  async uploadPlainData(
    data: string | object,
    filename: string,
    userId: string,
    description?: string,
  ) {
    this.logger.log(`Uploading plain data: ${filename}`);

    const result = await this.arkaCDN.uploadPlainData(data, filename, description);

    this.logger.log(`Plain data uploaded successfully: ${result.data.fileId}`);
    return result.data;
  }

  /**
   * List all files for the authenticated user
   */
  async listUserFiles(userId: string) {
    const result = await this.arkaCDN.listFiles();
    return result.data;
  }

  /**
   * Get detailed file information
   */
  async getFile(fileId: string, userId: string, includeData = false) {
    const result = await this.arkaCDN.getFile(fileId);
    return result.data;
  }

  /**
   * Get text content from a file
   */
  async getTextContent(fileId: string, userId: string) {
    const result = await this.arkaCDN.getTextContent(fileId);
    return result.data;
  }

  /**
   * Get JSON content from a file
   */
  async getJsonContent(fileId: string, userId: string) {
    const result = await this.arkaCDN.getJsonContent(fileId);
    return result.data;
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string, userId: string) {
    await this.arkaCDN.deleteFile(fileId);
    return { message: 'File deleted successfully' };
  }

  /**
   * Get file upload status
   */
  async getFileStatus(fileId: string, userId: string) {
    const result = await this.arkaCDN.getFileStatus(fileId);
    return result.data;
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(fileId: string): string {
    return this.arkaCDN.getPublicUrl(fileId);
  }

  /**
   * Download file content directly
   */
  async downloadFile(fileId: string) {
    return await this.arkaCDN.downloadFile(fileId);
  }
}

