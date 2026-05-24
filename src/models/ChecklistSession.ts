import mongoose, { Schema } from "mongoose";

const ChecklistSessionSchema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
      ref: "User",
    },
    date_string: {
      type: String,
      required: true,
    },
    completed_ids: {
      type: [String],
      default: [],
    },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Create compound index to guarantee unique session per day per user
ChecklistSessionSchema.index({ user_id: 1, date_string: 1 }, { unique: true });

export const ChecklistSession =
  mongoose.models.ChecklistSession ||
  mongoose.model("ChecklistSession", ChecklistSessionSchema);
