import mongoose, { Schema } from "mongoose";

const TradeChecklistSchema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ["Pre-Market", "Entry", "Risk Management", "Exit", "Post-Trade"],
      default: "Pre-Market",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    is_active: {
      type: Boolean,
      required: true,
      default: true,
    },
    is_deleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    delete_at: {
      type: Date,
      required: false,
    },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const TradeChecklist =
  mongoose.models.TradeChecklist ||
  mongoose.model("TradeChecklist", TradeChecklistSchema);
