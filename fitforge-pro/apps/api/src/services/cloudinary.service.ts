import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly configured: boolean;

  constructor(private readonly config: ConfigService) {
    const cloudName = config.get<string>('cloudinary.cloudName');
    const apiKey = config.get<string>('cloudinary.apiKey');
    const apiSecret = config.get<string>('cloudinary.apiSecret');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
      this.configured = true;
      this.logger.log('✅ Cloudinary configured');
    } else {
      this.configured = false;
      this.logger.warn('⚠️  Cloudinary not configured. File uploads will be disabled.');
    }
  }

  async uploadImage(
    buffer: Buffer,
    folder: string,
    options: {
      transformation?: any[];
      publicId?: string;
      tags?: string[];
    } = {},
  ): Promise<{ url: string; publicId: string; secureUrl: string }> {
    if (!this.configured) {
      return {
        url: 'https://placeholder.fitforgepro.in/image.jpg',
        publicId: 'placeholder',
        secureUrl: 'https://placeholder.fitforgepro.in/image.jpg',
      };
    }

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `fitforgepro/${folder}`,
          public_id: options.publicId,
          tags: options.tags,
          transformation: options.transformation ?? [
            { quality: 'auto', fetch_format: 'auto' },
          ],
          resource_type: 'image',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            reject(error ?? new Error('Upload failed'));
            return;
          }
          resolve({
            url: result.url,
            publicId: result.public_id,
            secureUrl: result.secure_url,
          });
        },
      );

      Readable.from(buffer).pipe(stream);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!this.configured) return;

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      this.logger.warn(`Failed to delete image ${publicId}`, error);
    }
  }

  async uploadAvatar(buffer: Buffer, userId: string) {
    return this.uploadImage(buffer, 'avatars', {
      publicId: `avatar_${userId}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });
  }

  async uploadGalleryImage(buffer: Buffer, imageId: string) {
    return this.uploadImage(buffer, 'gallery', {
      publicId: `gallery_${imageId}`,
      transformation: [
        { width: 1920, height: 1080, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
      tags: ['gallery'],
    });
  }
}
