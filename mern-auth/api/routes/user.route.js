import express from 'express';
import {
  test,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/verifyUser.middleware.js';
import { imageUpload } from '../middleware/multer.middleware.js';

const router = express.Router();

router.get('/', test);
router.put('/update/:id', verifyToken,imageUpload.single("profilePicture"), updateUser);
router.delete('/delete/:id', verifyToken, deleteUser);

export default router;
