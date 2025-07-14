import { v2 as cloudinary } from 'cloudinary';
import { parsedEnv } from '../config/env';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    const env = parsedEnv();
    return cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
  },
};
