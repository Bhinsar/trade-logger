import mongoose, { Schema } from "mongoose";

const TradeSchema = new Schema({
    user_id: {
        type: String,
        required: true,
        ref: "User"
    },
    symbol: {
        type: String,
        required: true,
    },
    entry_price: {
        type: Schema.Types.Decimal128,
        required: true,
    },
    exit_price: {
        type: Schema.Types.Decimal128,
        required: true,
    },
    quantity: {
        type: Schema.Types.Decimal128,
        required: true,
    },
    pnl_nominal: {
        type: Schema.Types.Decimal128,
        required: true,
    },
    pnl_percentage: {
        type: Number,
        required: true,
    },
    entry_time: {
        type: Date,
        required: true,
    },
    exit_time: {
        type: Date,
        required: true,
    },
    strategy_id: {
        type: String,
        required: true,
        ref: "Strategies"
    },
    notes: {
        type: String,
        required: false,
    },
    trade_image_url: {
        type: [String],
        required: false,
    },
    side: {
        type: String,
        enum: ['Long', 'Short'],
        required: true
    },
    asset_class: {
        type: String,
        enum: ['Equity', 'Crypto', 'Forex', 'Options'],
        default: 'Equity'
    },
    entry_confidence: {
        type: Number,
        required: false,
        min: 1,
        max: 10,
        default: 5
    },
    satisfaction_rating: {
        type: Number,
        required: false,
        min: 1,
        max: 10,
        default: 5
    },
    mistakes_made: {
        type: [String],
        required: false,
    },
    lessons_learned: {
        type: [String],
        required: false,
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

export const Trade = mongoose.models.Trade || mongoose.model("Trade", TradeSchema);