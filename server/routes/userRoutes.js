import express from 'express';
import {
  saveJob, removeSavedJob, getSavedJobs,
  getGithubRepos, getGithubAnalysis,
  uploadCV, downloadCV, deleteCV, analyzeCV,
  updateProfile, getProfile,
} from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.get('/saved-jobs', getSavedJobs);
router.post('/saved-jobs', saveJob);
router.delete('/saved-jobs/:jobId', removeSavedJob);

router.get('/github-repos', getGithubRepos);
router.get('/github-analysis', getGithubAnalysis);

router.post('/cv', uploadCV);
router.get('/cv/download', downloadCV);
router.delete('/cv', deleteCV);
router.post('/cv/analyze', analyzeCV);

export default router;