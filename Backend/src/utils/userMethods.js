import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (candidatePassword, user) => {
  try {
    return await bcrypt.compare(candidatePassword, user.password);
  } catch (err) {
    throw err;
  }
};

export const generateAccessToken = (user) => {
  try {
    const payload = { userId: user.id, email: user.email };
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const token = jwt.sign(payload, secret, { expiresIn: "2d" });
    return token;
  } catch (err) {
    throw err;
  }
};