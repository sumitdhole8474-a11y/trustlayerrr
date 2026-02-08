import mongoose from "mongoose";

const ApiKeySchema = new mongoose.Schema(
  {
    key: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    revoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.ApiKey ||
  mongoose.model("ApiKey", ApiKeySchema);
