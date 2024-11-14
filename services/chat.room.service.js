import RoomModel from "../model/chat.room.model.js";

/**
 * Creates a new chat room.
 * @param {Array} users - Array of user IDs.
 * @param {Array} userTypes - Array of user types matching the users, e.g., ["Homeowner", "Contractor"].
 * @param {mongoose.Types.ObjectId} jobId - ID of the associated job.
 * @returns {Object} - The created room document.
 */
export const createRoom = async (users, jobId) => {
  // Validate inputs
  if (!users) {
    throw new Error("Invalid users or userTypes provided.");
  }

  try {
    const existingRoom = await RoomModel.findOne({
      users: { $all: users, $size: users.length },
    });

    if (existingRoom) {
      return existingRoom;
    }
    // Create a new room document
    const newRoom = new RoomModel({
      users,
      userTypes: ["Homeowner", "Contractor"],
      job: jobId,
      unreadMessages: users.reduce((acc, userId) => {
        acc[userId] = 0;
        return acc;
      }, {}),
    });

    // Save the room to the database
    const savedRoom = await newRoom.save();
    return savedRoom;
  } catch (error) {
    console.error("Error creating room:", error);
  }
};
