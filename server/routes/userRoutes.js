import express from 'express';
import { saveJob, removeSavedJob, getSavedJobs, getGithubRepos, uploadCV, downloadCV, deleteCV } from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/saved-jobs', getSavedJobs);
router.post('/saved-jobs', saveJob);
router.delete('/saved-jobs/:jobId', removeSavedJob);

router.get('/github-repos', getGithubRepos);

router.post('/cv', uploadCV);
router.get('/cv/download', downloadCV);
router.delete('/cv', deleteCV);

export default router;