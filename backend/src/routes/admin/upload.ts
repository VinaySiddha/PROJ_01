/**
 * @file Admin upload routes — image upload via base64 to Cloudinary
 * @module routes/admin/upload
 */
import { Router } from 'express';
import { uploadImage } from '../../controllers/admin/upload.controller';

const router = Router();

router.post('/', uploadImage);

export default router;
