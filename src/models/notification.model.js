import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: "User", // Can be the customer or provider receiving the notification
        required: true,
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User", // Optional: could be the system or another user
        default: null,
    },
    type: {
        type: String,
        enum: ["booking_confirmation", "booking_cancellation", "booking_update", "general"],
        required: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    booking: {
        type: Schema.Types.ObjectId,
        ref: "Booking", // Reference to the Booking model
        required: true,
    },
    read: {
        type: Boolean,
        default: false, // False initially (unread)
    },
}, {
    timestamps: true,
});

export const Notification = mongoose.model("Notification", notificationSchema);
