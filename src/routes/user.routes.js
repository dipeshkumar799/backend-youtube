import { Router } from "express";
import { loggedOutUser, registerUser } from "../controllers/user.controller.js";
import { loginUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
import { changeCurrentPassword } from "../controllers/user.controller.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),

    registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, loggedOutUser);
router.route("/refreshToken").post(refreshAccessToken);
router.route("/changeCurrentPassword").post(changeCurrentPassword);

export default router;
