import Pin from "../modles/PinModle.js";
import {supabase} from "../lib/supabaseClient.js"
import User from "../modles/UserModle.js";

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const createPin=async(req,res)=>{
    try {
        const userId = req.userId; 
        const file = req.file;
        const { title, description, location, lat, lng } = req.body;
        if (!title || !location || !file) {
            return res.status(400).json({ message: "Title, location, and image are required" });
        }
        // 🖼️ Upload image to Supabase
        const fileName = `pins/${userId}-${Date.now()}-${file.originalname}`;

        const { error: uploadError } = await supabase.storage
        .from("Pins") // reuse your bucket or create a new one called "pin-images"
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
        });

        if (uploadError) {
        console.error(uploadError);
        return res.status(500).json({ message: "Image upload failed" });
        }

        // 🌍 Get public URL
        const { data: publicUrlData } = supabase.storage
        .from("Pins")
        .getPublicUrl(fileName);

        // 📌 Save pin to DB
        const pin = new Pin({
        user: userId,
        title,
        description,
        location,
        coordinates: {
            lat: lat || null,
            lng: lng || null,
        },
        image: publicUrlData.publicUrl,
        });

        await pin.save();

        res.status(201).json({
        success: true,
        message: "Pin created successfully",
        pin,
        });
    } catch (error) {
        console.error("Error creating pin:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getPins = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    let query = {};
    if (req.userId && req.user) {
      const followingIds = req.user.following || [];
      query = {
        $or: [
          { user: { $in: followingIds } },
        ]
      };
      const publicUsers = await User.find({ isPrivate: false }).select("_id");
      const publicUserIds = publicUsers.map(u => u._id);
      query.$or.push({ user: { $in: publicUserIds } });
    } else {
      const publicUsers = await User.find({ isPrivate: false }).select("_id");
      const publicUserIds = publicUsers.map(u => u._id);
      query = { user: { $in: publicUserIds } };
    }

    const [pins, total] = await Promise.all([
      Pin.find(query)
        .populate("user", "name avatar")
        .populate("comments.user", "name avatar")
        .populate("likes", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Pin.countDocuments(query)
    ]);

    res.json({ success: true, pins, page, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Error fetching pins:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deletePin = async (req, res) => {
  try {
    const userId = req.userId;
    const pinId = req.params.id;
    const pin = await Pin.findById(pinId);

    if (!pin) {
      return res.status(404).json({ message: "Pin not found" });
    }
    if (pin.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await Pin.findByIdAndDelete(pinId);
    res.json({ success: true, message: "Pin deleted successfully" });
  } catch (error) {
    console.error("Error deleting pin:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOnePin = async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id)
      .populate("user", "name avatar")
      .populate("comments.user", "name avatar")
      .populate("likes", "name avatar");

    if (!pin) return res.status(404).json({ message: "Pin not found" });

    res.json({ success: true, pin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const LikeAPin = async (req, res) => {
  try {
    const userId = req.userId;
    let pin = await Pin.findById(req.params.id);
    if (!pin) {
      return res.status(404).json({ success: false, message: "Pin not found" });
    }

    // Toggle like
    if (pin.likes.includes(userId)) {
      pin.likes = pin.likes.filter((id) => id.toString() !== userId.toString());
      await pin.save();
      const populatedPin = await Pin.findById(pin._id)
        .populate("user", "name avatar")
        .populate("comments.user", "name avatar")
        .populate("likes", "name avatar");

      return res.status(200).json({
        success: true,
        message: "Pin unliked successfully",
        pin: populatedPin,
      });
    } else {
      pin.likes.push(userId);
      await pin.save();
      const populatedPin = await Pin.findById(pin._id)
        .populate("user", "name avatar")
        .populate("comments.user", "name avatar")
        .populate("likes", "name avatar");

      return res.status(200).json({
        success: true,
        message: "Pin liked successfully",
        pin: populatedPin,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const comment =async(req,res)=>{
  try {
    const userId=req.userId;
    const pin =await  Pin.findById(req.params.id);
    const {comment}=req.body;
    if (!pin) return res.status(404).json({ message: "Pin not found" });

    if(!comment)return res.status(400).json({success:false,message:"please add a comment"});
    
    pin.comments.push({
      user:userId,
      text:comment
    })
    await pin.save();
    const updatedPin = await Pin.findById(pin._id).populate("comments.user", "name avatar");

    res.status(201).json({success:true,message:"comment added successfully",pin:updatedPin});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFollowingPins=async(req,res)=>{
  try {
    const userId=req.userId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const user=await User.findById(userId).populate("following","_id");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const followingIds = user.following.map(f => f._id);
    const query = { user: { $in: [...followingIds, userId] } };

    const [pins, total] = await Promise.all([
      Pin.find(query)
        .populate("user", "name avatar")
        .populate("comments.user", "name avatar")
        .populate("likes", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Pin.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      pins,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching following pins:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const search = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const regex = new RegExp(escapeRegex(query), "i");
    const userId = req.userId;

    let followingIds = [];
    if (userId) {
      const currentUser = await User.findById(userId).select("following");
      if (currentUser) {
        followingIds = currentUser.following || [];
      }
    }

    const visibilityFilter = {
      $or: [
        { isPrivate: false },
        { _id: userId },
        { _id: { $in: followingIds } }
      ]
    };

    const [users, visibleUsers, pinResults] = await Promise.all([
      User.find({
        $and: [
          { $or: [{ name: regex }, { email: regex }, { bio: regex }] },
          visibilityFilter
        ]
      }).select("name email avatar bio"),
      User.find(visibilityFilter).select("_id"),
      (async () => {
        const visibleUserIds = (await User.find(visibilityFilter).select("_id")).map(u => u._id);
        const pinQuery = {
          $and: [
            { $or: [{ title: regex }, { description: regex }, { location: regex }] },
            { user: { $in: visibleUserIds } }
          ]
        };
        const [pins, total] = await Promise.all([
          Pin.find(pinQuery)
            .populate("user", "name avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
          Pin.countDocuments(pinQuery)
        ]);
        return { pins, total };
      })()
    ]);

    res.status(200).json({
      success: true,
      users,
      pins: pinResults.pins,
      page,
      total: pinResults.total,
      totalPages: Math.ceil(pinResults.total / limit),
    });

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
