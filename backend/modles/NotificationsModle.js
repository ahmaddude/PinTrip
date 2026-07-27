import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["like", "comment", "follow", "followAccepted", "mention"], required: true },
    pin: { type: mongoose.Schema.Types.ObjectId, ref: "Pin" }, // optional for likes/comments/mentions
    message: { type: String }, // optional custom message
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1 });
NotificationSchema.index({ recipient: 1, read: 1 });

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;