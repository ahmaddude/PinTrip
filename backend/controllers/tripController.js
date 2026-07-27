import Trip from "../modles/TripModle.js";
import Pin from "../modles/PinModle.js";
import { supabase } from "../lib/supabaseClient.js";

export const createTrip = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description, startDate, endDate, visibility } = req.body;
    const file = req.file;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    let coverPhotoUrl = null;
    if (file) {
      const fileName = `trips/${userId}-${Date.now()}-${file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from("Pins")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error(uploadError);
        return res.status(500).json({ message: "Cover photo upload failed" });
      }

      const { data: publicUrlData } = supabase.storage
        .from("Pins")
        .getPublicUrl(fileName);
      coverPhotoUrl = publicUrlData.publicUrl;
    }

    const trip = new Trip({
      user: userId,
      title,
      description,
      startDate: startDate || null,
      endDate: endDate || null,
      visibility: visibility || "public",
      coverPhotoUrl,
    });

    await trip.save();

    res.status(201).json({
      success: true,
      message: "Trip created successfully",
      trip,
    });
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("user", "name avatar");

    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const pins = await Pin.find({ trip: trip._id })
      .populate("user", "name avatar")
      .populate("comments.user", "name avatar")
      .populate("likes", "name avatar")
      .populate("taggedUsers", "name avatar")
      .sort({ tripOrder: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      trip,
      pins,
    });
  } catch (error) {
    console.error("Error fetching trip:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserTrips = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;
    const currentUserId = req.userId;

    let query = { user: userId };

    if (userId !== currentUserId) {
      query.visibility = { $ne: "private" };
    }

    const trips = await Trip.find(query)
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    const tripsWithCounts = await Promise.all(
      trips.map(async (trip) => {
        const pinCount = await Pin.countDocuments({ trip: trip._id });
        return { ...trip.toObject(), pinCount };
      })
    );

    res.status(200).json({
      success: true,
      trips: tripsWithCounts,
    });
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const userId = req.userId;
    const tripId = req.params.id;
    const { title, description, startDate, endDate, visibility } = req.body;
    const file = req.file;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    if (trip.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (file) {
      const fileName = `trips/${userId}-${Date.now()}-${file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from("Pins")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("Pins")
          .getPublicUrl(fileName);
        trip.coverPhotoUrl = publicUrlData.publicUrl;
      }
    }

    if (title !== undefined) trip.title = title;
    if (description !== undefined) trip.description = description;
    if (startDate !== undefined) trip.startDate = startDate || null;
    if (endDate !== undefined) trip.endDate = endDate || null;
    if (visibility !== undefined) trip.visibility = visibility;

    await trip.save();

    res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      trip,
    });
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const userId = req.userId;
    const tripId = req.params.id;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    if (trip.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Pin.updateMany({ trip: tripId }, { trip: null, tripOrder: null });

    await Trip.findByIdAndDelete(tripId);

    res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const assignPinToTrip = async (req, res) => {
  try {
    const userId = req.userId;
    const pinId = req.params.id;
    const { tripId, tripOrder } = req.body;

    const pin = await Pin.findById(pinId);
    if (!pin) {
      return res.status(404).json({ success: false, message: "Pin not found" });
    }

    if (pin.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (tripId) {
      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json({ success: false, message: "Trip not found" });
      }

      if (trip.user.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
      }

      pin.trip = tripId;
      pin.tripOrder = tripOrder || 0;
    } else {
      pin.trip = null;
      pin.tripOrder = null;
    }

    await pin.save();

    const populatedPin = await Pin.findById(pin._id)
      .populate("user", "name avatar")
      .populate("comments.user", "name avatar")
      .populate("likes", "name avatar")
      .populate("taggedUsers", "name avatar")
      .populate("trip");

    res.status(200).json({
      success: true,
      message: tripId ? "Pin added to trip" : "Pin removed from trip",
      pin: populatedPin,
    });
  } catch (error) {
    console.error("Error assigning pin to trip:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const reorderTripPins = async (req, res) => {
  try {
    const userId = req.userId;
    const tripId = req.params.id;
    const { pinOrders } = req.body;

    if (!pinOrders || !Array.isArray(pinOrders)) {
      return res.status(400).json({ success: false, message: "pinOrders array is required" });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    if (trip.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const bulkOps = pinOrders.map(({ pinId, order }) => ({
      updateOne: {
        filter: { _id: pinId, trip: tripId },
        update: { tripOrder: order },
      },
    }));

    await Pin.bulkWrite(bulkOps);

    const pins = await Pin.find({ trip: tripId })
      .populate("user", "name avatar")
      .populate("comments.user", "name avatar")
      .populate("likes", "name avatar")
      .populate("taggedUsers", "name avatar")
      .sort({ tripOrder: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      message: "Pins reordered successfully",
      pins,
    });
  } catch (error) {
    console.error("Error reordering pins:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addExistingPinToTrip = async (req, res) => {
  try {
    const userId = req.userId;
    const tripId = req.params.id;
    const { pinId, tripOrder } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    if (trip.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const pin = await Pin.findById(pinId);
    if (!pin) {
      return res.status(404).json({ success: false, message: "Pin not found" });
    }

    if (pin.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const maxOrder = await Pin.findOne({ trip: tripId })
      .sort({ tripOrder: -1 })
      .select("tripOrder");

    pin.trip = tripId;
    pin.tripOrder = tripOrder !== undefined ? tripOrder : (maxOrder ? maxOrder.tripOrder + 1 : 0);
    await pin.save();

    const populatedPin = await Pin.findById(pin._id)
      .populate("user", "name avatar")
      .populate("comments.user", "name avatar")
      .populate("likes", "name avatar")
      .populate("taggedUsers", "name avatar")
      .populate("trip");

    res.status(200).json({
      success: true,
      message: "Pin added to trip",
      pin: populatedPin,
    });
  } catch (error) {
    console.error("Error adding pin to trip:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
