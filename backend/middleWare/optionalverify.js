import jwt from "jsonwebtoken";
import User from "../modles/UserModle.js";

export const optionalAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    req.userId = null;
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      req.userId = null;
      req.user = null;
      return next();
    }
    req.userId = decoded.userId;
    req.user = await User.findById(req.userId);
    next();
  } catch (err) {
    req.userId = null;
    req.user = null;
    next();
  }
};