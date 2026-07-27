import express from "express";
import { verifyToken } from "../middleWare/verifyToken.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/", verifyToken, getNotifications);
notificationRouter.get("/unread-count", verifyToken, getUnreadCount);
notificationRouter.put("/:id/read", verifyToken, markAsRead);
notificationRouter.put("/read-all", verifyToken, markAllAsRead);

export default notificationRouter;
