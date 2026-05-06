import mongoose, { Schema } from "mongoose";

const StrategiesSchema = new Schema({
    user_id: {
        type: String,
        required: true,
        ref: "User"
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    is_deleted: {
        type: Boolean,
        required: true,
        default: false
    },
    delete_at: {
        type: Date,
        required: false,
    }
}, {
    strict: true,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export const Strategies = mongoose.models.Strategies || mongoose.model("Strategies", StrategiesSchema);