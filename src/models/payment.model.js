import mongoose, { Schema } from "mongoose";



const paymentSchema = new Schema(
    {
        booking: {
             type: Schema.Types.ObjectId, 
             ref: 'Booking',
             required: true
             },
        amount: { 
            type: Number,
             required: true
             },
        paymentMethod: {
             type: String,
             enum: ['credit_card', 'debit_card', 'paypal', 'cash'],
             required: true 
            },
        status: {
             type: String, 
             enum: ['pending', 'completed', 'failed'],
              required: true },
        createdAt: {
             type: Date,
              default: Date.now
             }
    }
)

export const Payment = mongoose.model("Payment",paymentSchema);