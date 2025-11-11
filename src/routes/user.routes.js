import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verify } from "jsonwebtoken";

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
export default router;
