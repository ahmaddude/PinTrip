import express from "express";
import multer from "multer";
import { comment, createPin, deletePin, getFollowingPins, getMyPins, getOnePin, getPins, LikeAPin, search } from "../controllers/pinController.js";
import { verifyToken } from "../middleWare/verifyToken.js";
import { optionalAuth } from "../middleWare/optionalverify.js";

const pinRouter = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

pinRouter.post("/create", verifyToken, upload.array("images", 10), createPin);

pinRouter.get("/my-pins", verifyToken, getMyPins);

pinRouter.get("/pins", optionalAuth, getPins);

pinRouter.delete("/delete/:id",verifyToken,deletePin);

pinRouter.get("/following-pins",verifyToken,getFollowingPins);

pinRouter.get("/search",search)

pinRouter.get("/:id",getOnePin);

pinRouter.put("/like/:id",verifyToken,LikeAPin);

pinRouter.put("/comment/:id",verifyToken,comment);


export default pinRouter;
