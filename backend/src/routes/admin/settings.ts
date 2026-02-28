/**
 * @file Admin settings routes
 * @module routes/admin/settings
 */
import { Router } from 'express';
import { getSettings, updateSettings } from '../../controllers/admin/settings.controller';
import { requireRole } from '../../middleware/admin.middleware';

const router = Router();

router.get('/', getSettings);
// Only super_admin can update settings
router.put('/', requireRole('super_admin'), updateSettings);

export default router;
