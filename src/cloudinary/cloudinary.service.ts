import { Injectable, Inject } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinaryConfig: any) {}

  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error)
            return reject(
              new Error(error.message || 'Error uploading to Cloudinary'),
            );
          if (!result) return reject(new Error('No result from Cloudinary'));
          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }
}
