import mongoose from 'mongoose';

const BusinessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    taxId: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    ownerId: {
      type: String,
      required: [true, 'Owner ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Suspended'],
      default: 'Active',
    },
    revenue: {
      type: String,
      default: '',
    },
    created: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create indexes
BusinessSchema.index({ ownerId: 1, name: 1 }, { unique: false });

// Check if model exists to prevent OverwriteModelError
export default mongoose.models.Business || mongoose.model('Business', BusinessSchema);