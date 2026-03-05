import express from 'express';
import { scrapeRemoteJobs } from '../controllers/scrapeController.js';
import { getCareerjetJobs } from '../controllers/jobController.js';
import {
  getCareerjetSpainJobs,
  getTecnoempleoJobs,
  getInfojobsJobs,
  getIndeedSpainJobs,
  getAllSpainJobs,
} from '../controllers/spainJobController.js';

const router = express.Router();

// Rutas originales
router.get('/remoteok', scrapeRemoteJobs);
router.get('/careerjet', getCareerjetJobs);

// Rutas España
router.get('/careerjet-es', getCareerjetSpainJobs);
router.get('/tecnoempleo', getTecnoempleoJobs);
router.get('/infojobs', getInfojobsJobs);
router.get('/indeed-es', getIndeedSpainJobs);
router.get('/spain-all', getAllSpainJobs);

export default router;
