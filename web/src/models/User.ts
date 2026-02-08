import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: String,

    resetPasswordAllowed: {
      type: Boolean,
      default: false,
    },
    resetPasswordOtp: String,
    resetPasswordOtpExpires: Date,

    emailVerified: { type: Boolean, default: false },
    emailOtp: String,
    emailOtpExpires: Date,

    // 🕒 cooldown control
    lastOtpSentAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);