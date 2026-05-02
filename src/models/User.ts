import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    google_id: { 
        type: String, 
        required: true, 
        unique: true // Critical: This is the primary link to Google
    },
    first_name: { 
        type: String, 
        required: true,
        trim: true 
    },
    last_name: { 
        type: String, 
        required: true,
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
    },
    image: {
        type: String // To store the Google profile picture URL
    },
    is_deleted: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    strict: true,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);