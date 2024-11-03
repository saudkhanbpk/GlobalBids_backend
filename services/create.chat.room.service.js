import RoomModel from "../model/chat.room.model.js";
import mongoose from "mongoose";

const roomService = {
  /**
   * Creates a new chat room.
   *
   * @param {Array<string>} users - Array of user IDs.
   * @param {Array<string>} userTypes - Array of user types corresponding to each user (e.g., "Homeowner", "Contractor").
   * @param {string} [projectId] - Optional project ID associated with the room.
   * @returns {Promise<Object>} - The created room document.
   */
  async createRoom(users, userTypes, projectId = null) {
    if (!users || !userTypes || users.length !== userTypes.length) {
      throw new Error("Invalid users or userTypes input.");
    }

    const roomData = {
      users: users.map((id) => {
        return new mongoose.Types.ObjectId(id);
      }),
      userTypes,
    };
    if (projectId) {
      roomData.project = new mongoose.Types.ObjectId(projectId);
    }

    const room = new RoomModel(roomData);
    return room.save();
  },
};

export default roomService;
