/**
 * @file Admin error log routes
 * @module routes/admin/errorLogs
 */
import { Router } from 'express';
import { listErrorLogs } from '../../controllers/admin/errorLogs.controller';

const router = Router();

router.get('/', listErrorLogs);

export default router;
