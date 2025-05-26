import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
    {

        booking: {
             type: mongoose.Schema.Types.ObjectId,
              ref: 'Booking',
               required: true
             },
        customer: {
             type: Schema.Types.ObjectId,
              ref: 'User',
               required: true
             },
        service: {
             type: Schema.Types.ObjectId,
              ref: 'Service',
               required: true
             },
        rating: { 
            type: Number,
             min: 1,
              max: 5,
              required: true
             },
        comment: String,
        
    },{
        timestamps:true,
    }
);

export const Review = mongoose.model("Review",reviewSchema);