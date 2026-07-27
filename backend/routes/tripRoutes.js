import express from "express";
import multer from "multer";
import { verifyToken } from "../middleWare/verifyToken.js";
import { optionalAuth } from "../middleWare/optionalverify.js";
import {
  createTrip,
  getTrip,
  getUserTrips,
  updateTrip,
  deleteTrip,
  assignPinToTrip,
  reorderTripPins,
  addExistingPinToTrip,
} from "../controllers/tripController.js";

const tripRouter = express.Router();
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

tripRouter.post("/create", verifyToken, upload.single("coverPhoto"), createTrip);

tripRouter.get("/user/:userId", optionalAuth, getUserTrips);

tripRouter.get("/my-trips", verifyToken, getUserTrips);

tripRouter.get("/:id", optionalAuth, getTrip);

tripRouter.put("/:id", verifyToken, upload.single("coverPhoto"), updateTrip);

tripRouter.delete("/:id", verifyToken, deleteTrip);

tripRouter.patch("/pin/:id/assign", verifyToken, assignPinToTrip);

tripRouter.patch("/:id/reorder", verifyToken, reorderTripPins);

tripRouter.patch("/:id/add-pin", verifyToken, addExistingPinToTrip);

export default tripRouter;
