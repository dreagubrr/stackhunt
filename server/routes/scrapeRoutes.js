import express from 'express';
import { scrapeRemoteJobs } from '../controllers/scrapeController.js';
import {
  getCareerjetSpainJobs,
  getTecnoempleoJobs,
  getAllSpainJobs,
} from '../controllers/spainJobController.js';

const router = express.Router();

router.get('/remoteok', scrapeRemoteJobs);
router.get('/tecnoempleo', getTecnoempleoJobs);
router.get('/careerjet-es', getCareerjetSpainJobs);
router.get('/spain-all', getAllSpainJobs);

export default router;
