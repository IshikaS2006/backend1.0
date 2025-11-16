import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/jwt.middleware.js";


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
router.route('/logout').post(verifyJwt, logoutUser); //logout user
router.route('/refresh-token').post(refreshToken); //refresh token
router.route('/change-password').post(verifyJwt, changePassword); //change password
router.route('/current-user').get(verifyJwt, getCurrentUser); //get current user
router.route('/update-account').patch(verifyJwt, updateAccountDetails); //update account details
router.route('/update-avatar').patch(verifyJwt, upload.single('avatar'), avatarUpdate); //update avatar
router.route('/cover-image').patch(verifyJwt, upload.single('coverImage'), coverImageUpdate); //update cover image
router.route('/c/:username').get(verifyJwt, getUserProfileByUsername); //get user profile by username
router.route('/history').get(verifyJwt, getUserHistory); //get user history

export default router;
