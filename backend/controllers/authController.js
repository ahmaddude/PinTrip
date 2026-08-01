import User from "../modles/UserModle.js"
import bcryptjs from "bcryptjs"
import crypto from "crypto"
import { sendMail } from "../utils/mailer.js";
import { TokenAndCookie } from "../utils/tokensMaker.js";
import {verifyGoogleToken} from "../utils/googleVerify.js";
import { supabase } from "../lib/supabaseClient.js";


export const signup=async(req,res)=>{
    const {name,email,password}=req.body;
    try {
        if(!email||!password||!name){
            throw new Error ("all fields are required");
        }
        if(password.length<8){
            throw new Error("Password must be at least 8 characters");
        }
        const arleadyExists=await User.findOne({email})
        if(arleadyExists){
            return res.status(400).json({success:false, message:"User already exists"});        
        }
        const hashedPass=await bcryptjs.hash(password,10);
        const verificationToken=Math.floor(100000+Math.random()*900000).toString();

        const user=new User({
            email,name,password:hashedPass,verificationToken,verificationTokenExpiresAt:Date.now()+1*60*60*1000
        })
        await user.save();
        await sendMail({
              to: email,
              subject: "Verify your PinTrip account",
              text: `Your verification code is ${verificationToken}`,
              html: `<p>Your verification code is <b>${verificationToken}</b>. It expires in 1 hour.</p>`,
            });

        await TokenAndCookie(res,user._id);
        res.status(201).json({
            success:true,
            message:"user created successfully",
            user:{
                ...user._doc,
                password:undefined
            },
        });
    } catch (error) {
            res.status(400).json({success:false, message: error.message});
    }
};

export const verifyAccount=async(req,res)=>{
    const {code}=req.body;
    try {
        const user=await User.findOne({
            verificationToken:code,
            verificationTokenExpiresAt:{
                $gt:Date.now(),
            }
        });
        if(!user){
            return res.status(400).json({success:false, message:"Invalid or expired verification code"});
        }

        user.isVerified=true;
        user.verificationToken=undefined;
        user.verificationTokenExpiresAt=undefined;
        await user.save();

        res.status(200).json({
            success:true,
            message:"account verified successfully",
            user:{
                ...user._doc,
                password:undefined
            }
        });
    } catch (error) {
        console.log("error in verify email",error);
        res.status(500).json({success:false, message:error.message});
    }
};

export const login=async(req,res)=>{
    const{email,password}=req.body;
    try {
        if(!email||!password){
            throw new Error ("all fields are required");
        };

        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({success:false,message:"Invalid Cridintials"})
        }

        const isPasswordMatched=await bcryptjs.compare(password,user.password);
        if(!isPasswordMatched){
            return res.status(400).json({success:false,message:"Invalid Cridintials"})
        }
        await TokenAndCookie(res,user._id);
        user.lastLogin=new Date();
        await user.save();
        res.status(200).json({
            success:true,
            message:"User logged in successfully",
            user:{
                ...user._doc,
                password:undefined
            },
        });
    } catch (error) {
        console.log("error in login",error);
        res.status(500).json({success:false, message:error.message});
    }
};

export const logout=async(req,res)=>{
    res.clearCookie("token",{
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:process.env.NODE_ENV==="production"?"strict":"lax",
        path:"/",
    });
    res.status(200).json({success:true, message:"Logged out successfully"});
};

export const forgotPassword=async(req,res)=>{
    const {email}=req.body;
    try {
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({success:false, message:"User not found"});
        };
        const resetToken=crypto.randomBytes(20).toString("hex");
        const resetTokenExp=Date.now()+1*60*60*1000;

        user.resetPasswordToken=resetToken;
        user.resetPasswordExpiresAt=resetTokenExp;
        await user.save();

        await sendMail({
              to: email,
              subject: "Reset your PinTrip Password",
              text: `Your reset code is ${resetToken}`,
              html: `<p>Your Password reset code is <b>${resetToken}</b>. It expires in 1 hour.</p>`,
            });
        res.status(200).json({success:true, message:"Password reset email sent"});

    } catch (error) {
        console.log("error in forgot password",error);
        res.status(500).json({success:false, message:error.message});
    }
};

export const resetPassword=async(req,res)=>{
    try {
        const {email, code, password}=req.body;
        if(!email||!code||!password){
            return res.status(400).json({success:false, message:"Email, code, and password are required"});
        }
        if(password.length<8){
            return res.status(400).json({success:false, message:"Password must be at least 8 characters"});
        }
        const user=await User.findOne({            
            email,
            resetPasswordToken: code,
            resetPasswordExpiresAt:{ $gt:Date.now() },
        });
        if(!user){
            return res.status(400).json({success:false, message:"Invalid or expired reset code"});
        };
        const hashedPassowrd=await bcryptjs.hash(password,10);
                        
        user.password=hashedPassowrd;
        user.resetPasswordToken=undefined;
        user.resetPasswordExpiresAt=undefined;
        await user.save();
        await sendMail({
              to: user.email,
              subject: " Your PinTrip Password has ben updated",
              text: `Your PinTrip password has ben updated successfully `,
              html: `<p>Your PinTrip password has ben updated,  if that wasnt you  contact support .</p>`,
            });
        res.status(200).json({success:true, message:"Password reset successfully"});

    } catch (error) {
        console.log("error in reset password",error);
        res.status(500).json({success:false, message:error.message});
    }
};

export const loginWithGoogle=async(req,res)=>{
    try {
        const {token}=req.body;
        if(!token){
            return res.status(400).json({
                success:false,
                message:"google token required"
            })
        }
        const googleUser=await verifyGoogleToken(token);
        if (!googleUser.emailVerified) {
      return res.status(400).json({ success: false, message: "Google account not verified" });
    };
    let user = await User.findOne({ email: googleUser.email });
    if(!user){
        //No User??? Create a User!!!✅🔥💪
        user = new User({
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.avatar,
        password: "", // no password for Google accounts
      });
      await user.save();
    }
    await TokenAndCookie(res, user._id);
    res.json({
      success: true,
      message: "Logged in with Google",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });

    }
};

export const checkAuth=async(req,res)=>{
    try {
        if (!req.userId) {
            return res.status(200).json({success:true, message:"Not authenticated", user:null});
        }
        const user=await User.findById(req.userId)
        if(!user){
        return res.status(200).json({success:true, message:"User not found", user:null});
        }
        res.status(200).json({success:true, message:"User found", user:{
            ...user._doc,
            password:undefined
        }});
    } catch (error) {
        console.log("error in check auth",error);
        res.status(500).json({success:false, message:error.message});
    }
};

export const updateProfile=async(req,res)=>{
    
    try {
        const userId = req.userId;
        const file = req.file;
        const {name, bio}=req.body
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({ message: "User not found" });
        };
        let profilePicUrl = user.avatar;
        if (file) {
            const fileName = `avatars/${userId}-${Date.now()}-${file.originalname}`;
        
              // Upload to Supabase
            const { error: uploadError } = await supabase.storage
                .from("Pins")
                .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
                });
        
            if (uploadError) {
                console.error(uploadError);
                return res.status(500).json({ message: "Image upload failed" });
            }
        
              // Get the public URL
            const { data: publicUrlData } = supabase.storage
                .from("Pins")
                .getPublicUrl(fileName);
        
            profilePicUrl = publicUrlData.publicUrl;
            }

            if (name) user.name = name;
            if (bio) user.bio = bio;
            user.avatar = profilePicUrl;

            await user.save();

            res.json({
                success:true,
                user:{
                    ...user._doc,
                    password:undefined
                },
            });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}