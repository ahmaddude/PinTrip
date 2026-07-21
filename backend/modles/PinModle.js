import mongoose from "mongoose";

const PinSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // the creator of the pin
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: true, // city, country, or place name
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    image: {
      type: String, // URL from Supabase
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
      comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],

  },
  
  { timestamps: true }
);

PinSchema.index({ user: 1 });
PinSchema.index({ createdAt: -1 });
PinSchema.index({ location: "text", title: "text", description: "text" });

 const Pin = mongoose.model("Pin", PinSchema);
export default Pin;