import  User  from "../modles/UserModle.js";
import  Pin  from "../modles/PinModle.js";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(req.params.id).select("-password -verificationToken -resetPasswordToken -verificationTokenExpiresAt");
    if (!user) return res.status(404).json({ message: "User not found" });

    const canView =
      !user.isPrivate ||
      user._id.toString() === userId ||
      user.followers.some(id => id.toString() === userId);

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: "This account is private",
      });
    }

    const isFriend = user.followers.some(id => id.toString() === userId) && user.following.some(id => id.toString() === userId);
    const hasSentRequest = user.followRequests.some(id => id.toString() === userId);
    const currentUser = userId ? await User.findById(userId).select("followRequests") : null;
    const hasReceivedRequest = currentUser?.followRequests?.some(id => id.toString() === req.params.id) || false;
    const isFollowing = user.following.some(id => id.toString() === userId);

    const followerCount = user.followers.length;
    const followingCount = user.following.length;

    const pins = await Pin.find({ user: user._id }).sort({ createdAt: -1 });

    const userObj = user.toObject();
    delete userObj.followers;
    delete userObj.following;
    delete userObj.followRequests;

    res.json({
      success: true,
      user: {
        ...userObj,
        isFriend,
        isFollowing,
        hasSentRequest,
        hasReceivedRequest,
        followerCount,
        followingCount,
      },
      pins,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const sendFollowReq = async (req, res) => {
  try {
    const userId = req.userId;
    const targetUserId = req.params.id;

    if (userId === targetUserId)
      return res.status(400).json({ message: "Cannot add yourself as a friend" });

    const sender = await User.findById(userId);
    const receiver = await User.findById(targetUserId);

    if (!receiver) return res.status(404).json({ message: "User not found" });

    if (receiver.followers.some(id => id.toString() === userId))
      return res.status(400).json({ message: "Already friends" });

    if (sender.followers.some(id => id.toString() === targetUserId) && sender.followRequests.some(id => id.toString() === targetUserId)) {
      sender.followers.push(targetUserId);
      receiver.following.push(userId);
      sender.followRequests = sender.followRequests.filter(id => id.toString() !== targetUserId);
      await sender.save();
      await receiver.save();
      return res.status(200).json({ message: "You are now friends!", autoAccepted: true });
    }

    if (receiver.followRequests.some(id => id.toString() === userId))
      return res.status(400).json({ message: "Friend request already sent" });

    receiver.followRequests.push(userId);
    await receiver.save();

    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const respondFollowRequest = async (req, res) => {
  try {
    const userId = req.userId; // receiver
    const { senderId, accept } = req.body;

    const receiver = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) return res.status(404).json({ message: "User not found" });

    // Remove from followRequests
    receiver.followRequests = receiver.followRequests.filter(id => id.toString() !== senderId);
    
    if (accept) {
      // Add to followers/following
      receiver.followers.push(senderId);
      sender.following.push(userId);
      await sender.save();
    }

    await receiver.save();

    res.status(200).json({ message: accept ? "Friend request accepted" : "Friend request rejected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const userId=req.userId;
    const user=await User.findById(userId)
      .populate("followers","name avatar")
      .populate("following","name avatar")
      .populate("followRequests","name avatar");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      followers: user.followers,
      following: user.following,
      followRequests: user.followRequests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// controllers/userController.js

export const unfollowUser = async (req, res) => {
  try {
    const userId = req.userId; // logged in user
    const targetId = req.params.id; // user to unfollow

    if (userId === targetId) {
      return res.status(400).json({ success: false, message: "You can't remove yourself" });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetId);

    if (!user || !targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // remove from both arrays
    user.following = user.following.filter((id) => id.toString() !== targetId);
    targetUser.followers = targetUser.followers.filter((id) => id.toString() !== userId);

    await user.save();
    await targetUser.save();

    res.status(200).json({ success: true, message: "Friend removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
