/**
 * @file Admin image upload controller — uploads base64 image data to Cloudinary
 * @module controllers/admin/upload
 */
import { Request, Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { sendSuccess } from '../../utils/response';
import { ValidationError } from '../../utils/errors';
import { config } from '../../config/index';

// Configure Cloudinary from env
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key:    config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure:     true,
});

/**
 * POST /api/admin/upload
 * Accepts { data: string (base64), folder?: string } in request body,
 * uploads to Cloudinary, and returns the secure URL.
 *
 * @param req  - body: { data: base64DataUrl, folder?: string }
 * @param res  - responds with { url: string, public_id: string }
 * @param next - error handler
 */
export async function uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data, folder = 'themagicscreen' } = req.body as { data?: string; folder?: string };

    if (!data) {
      throw new ValidationError('UPLOAD_MISSING_DATA', 'Image data is required.');
    }

    // Limit: ~5 MB base64 ≈ 3.75 MB actual
    if (data.length > 6_000_000) {
      throw new ValidationError('UPLOAD_TOO_LARGE', 'Image must be smaller than 4 MB.');
    }

    const result = await cloudinary.uploader.upload(data, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
      ],
    });

    sendSuccess(res, { url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    next(err);
  }
}
