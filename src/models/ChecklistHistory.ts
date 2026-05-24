import mongoose, { Schema } from "mongoose";

const ChecklistHistorySchema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
      ref: "User",
    },
    date: {
      type: Date,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    completed: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    items: {
      type: [String],
      required: true,
    },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const ChecklistHistory =
  mongoose.models.ChecklistHistory ||
  mongoose.model("ChecklistHistory", ChecklistHistorySchema);
