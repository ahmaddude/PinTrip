import express from "express";
import {checkAuth, forgotPassword, login, loginWithGoogle, logout, resetPassword, signup, updateProfile, verifyAccount} from "../controllers/authController.js";
import { verifyToken } from "../middleWare/verifyToken.js";
import multer from "multer";


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});


const authRouter=express.Router();

authRouter.post("/signup",signup);

authRouter.post("/verify",verifyAccount);

authRouter.post("/login", login);

authRouter.post("/logout", logout);

authRouter.post("/forgot-password",forgotPassword);

authRouter.post("/reset-password",resetPassword);

authRouter.post("/google", loginWithGoogle);

authRouter.get("/check-auth",verifyToken,checkAuth);

authRouter.put('/update-profile', verifyToken, upload.single("avatar"), updateProfile);


export default authRouter;