import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
      min: 0,
    },
    key: {
      type: String,
      required: [true, 'S3 key is required'],
      unique: true,
    },
    url: {
      type: String,
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
    },
    access: {
      type: String,
      enum: ['Secure', 'Restricted', 'Public'],
      default: 'Secure',
    },
    uploaded: {
      type: Date,
      default: Date.now,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      index: true,
    },
    ownerId: {
      type: String,
      required: [true, 'Owner ID is required'],
      index: true,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
DocumentSchema.index({ ownerId: 1, uploaded: -1 });
DocumentSchema.index({ businessId: 1, uploaded: -1 });
DocumentSchema.index({ access: 1 });
DocumentSchema.index({ fileType: 1 });

export default mongoose.models.Document || mongoose.model('Document', DocumentSchema);