import express from "express";
import { verifyToken } from "../middleWare/verifyToken.js";
import { getFollowers, getUserProfile, respondFollowRequest, sendFollowReq, unfollowUser } from "../controllers/userController.js";

const userRouter =express.Router();

userRouter.get("/followers",verifyToken,getFollowers);

userRouter.get("/:id",getUserProfile);

userRouter.post("/followReq/:id",verifyToken,sendFollowReq);

userRouter.post("/respondFollowReq",verifyToken,respondFollowRequest);

userRouter.post("/:id/unfollow", verifyToken, unfollowUser);


export default userRouter;