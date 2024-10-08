import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authSecret = process.env.JWT_SECRET;

/**
 * Generates a JWT token for a user.
 * @param {Object} user - The user object containing user details.
 * @param {string} user.id - The user ID.
 * @param {string} user.email - The user's email.
 * @param {string} user.role - The user's role.
 * @returns {string} - The generated JWT token.
 */
const generateAuthToken = async (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return await jwt.sign(payload, authSecret, {
    expiresIn: "7w",
    algorithm: "HS256",
  });
};

export default generateAuthToken;
