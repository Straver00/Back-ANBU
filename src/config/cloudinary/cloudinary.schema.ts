import { z } from 'zod';

export const cloudinarySchema = z.object({
  CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1, 'CLOUDINARY_CLOUD_NAME es obligatorio'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY es obligatorio'),
  CLOUDINARY_API_SECRET: z
    .string()
    .min(1, 'CLOUDINARY_API_SECRET es obligatorio'),
});

export type CloudinarySchema = z.infer<typeof cloudinarySchema>;
