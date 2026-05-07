import express from 'express';
import {
  getTecnoempleoJobs,
  getAllSpainJobs,
  getJoobleJobs,
  getAdzunaJobsController,
} from '../controllers/spainJobController.js';

const router = express.Router();

router.get('/tecnoempleo', getTecnoempleoJobs);
router.get('/jooble', getJoobleJobs);
router.get('/adzuna', getAdzunaJobsController);
router.get('/spain-all', getAllSpainJobs);

export default router;