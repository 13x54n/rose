import { Router } from 'express';
import { healthCheck } from '../controllers/healthController';
import { syncInstallation } from '../controllers/installationController';
import { syncMediaRegistry, getMediaRegistry, deleteMediaItem, uploadMedia, viewIpfsMedia } from '../controllers/mediaController';
import { upload } from '../middleware/upload';

const router = Router();

// Health check endpoint
router.get('/health', healthCheck);

// API v1 routes
const apiRouter = Router();

// Installation and Media sync endpoints
apiRouter.post('/installations', syncInstallation);
apiRouter.post('/media/sync', syncMediaRegistry);
apiRouter.get('/media/:installationId', getMediaRegistry);
apiRouter.delete('/media/:installationId/:localId', deleteMediaItem);
apiRouter.post('/media/upload', upload.single('file'), uploadMedia);
apiRouter.get('/media/view/:cid', viewIpfsMedia);

// Add your API routes here
// Example: apiRouter.use('/users', userRoutes);

router.use('/api/v1', apiRouter);

export default router;
