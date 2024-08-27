import express from 'express';
import { getPersonalData } from '../controllers/personalController.js';

const router = express.Router();

router.get('/db', getPersonalData);

export default router;