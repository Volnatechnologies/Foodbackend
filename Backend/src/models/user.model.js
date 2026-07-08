import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[6-9]\d{9}$/,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "USER"],
      default: "OWNER",
    },

    mobileVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function(next) {
    try {
      if (this.isModified && this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
      }
    } catch (err) {
      return next(err);
    }
});

// Attach instance methods directly so they are always available
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const match = await bcrypt.compare(candidatePassword, this.password);
    return match;
  } catch (err) {
    throw err;
  }
};

userSchema.methods.generateAccessToken = function () {
  try {
    const payload = { userId: this._id.toString(), email: this.email };
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const token = jwt.sign(payload, secret, { expiresIn: '2d' });
    return token;
  } catch (err) {
    throw err;
  }
};

const User = mongoose.model("User", userSchema);
export default User;