import { Router } from "express";
import { 
    loginUser, 
    registerUser, 
    logoutUser, 
    refreshToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    avatarUpdate,
    coverImageUpdate,
    getUserProfileByUsername,
    getUserHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";


const router = Router(); // ✅ no need for express.Router()

router.route('/register').post(
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'img', maxCount: 1 }
  ]),
  registerUser
);
router.route('/login').post(loginUser);
//secured routes can be added here
router.route('/logout').post(authMiddleware, logoutUser); //logout user
router.route('/refresh-token').post(refreshToken); //refresh token
router.route('/change-password').post(authMiddleware, changePassword); //change password
router.route('/current-user').get(authMiddleware, getCurrentUser); //get current user
router.route('/update-account').patch(authMiddleware, updateAccountDetails); //update account details
router.route('/update-avatar').patch(authMiddleware, upload.single('avatar'), avatarUpdate); //update avatar
router.route('/cover-image').patch(authMiddleware, upload.single('coverImage'), coverImageUpdate); //update cover image
router.route('/c/:username').get(authMiddleware, getUserProfileByUsername); //get user profile by username
router.route('/history').get(authMiddleware, getUserHistory); //get user history

export default router;
