import mongoose from "mongoose";

const UserSchema= new mongoose.Schema(
   {
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    avatar:{
        type:String,
        default:""
    },
    bio:{
        type:String,
        default:"Hi! Im Traveling!!"
    },
    location:{
        lat: { type: Number, required: false },
        lng: { type: Number, required: false }
    },
    lastLogin:{
        type:Date,
        default:Date.now
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPrivate: { type: Boolean, default: false }, 
    resetPasswordToken:String,
    resetPasswordExpiresAt:Date,
    verificationToken:String,
    verificationTokenExpiresAt:Date,
   } ,
   {
    timestamps:true
   }
);

UserSchema.index({ email: 1 });
UserSchema.index({ resetPasswordToken: 1 });
UserSchema.index({ verificationToken: 1 });
UserSchema.index({ followers: 1 });
UserSchema.index({ following: 1 });

const User=new mongoose.model("User",UserSchema);

export default User;