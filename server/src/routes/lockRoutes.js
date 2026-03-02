import express from 'express';
import { getLockedUser, lockUser, unlockUser } from '../controllers/lockController.js';

const router = express.Router();

router.get('/', getLockedUser);

router.post('/:userId', lockUser);
router.delete('/:userId', unlockUser);

export default router;
