import express from 'express';
import { signin, signup, signout } from '../controllers/auth.controller.js';
import { imageUpload } from '../middleware/multer.middleware.js';

const router = express.Router();

router.post('/signup',imageUpload.single("profilePicture"), signup);
router.post('/signin', signin);
// router.post('/google', google);
router.get('/signout', signout);

export default router;
