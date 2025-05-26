import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: "Service", // Links to the Service model
    required: true,
  },
  provider: {
    type: Schema.Types.ObjectId,
    ref: "User",
  }, // Assigned service provider
  date: {
    type: String,
    required: true,
  },
  shift: {
    type: String,
    enum: ["Morning", "Afternoon", "Evening"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Confirm", "Completed", "Canceled"],
    default: "Pending",
  },
  description:{
    type:String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  address:{
    houseNo: {
      type: String,
      required: true,
    },
    area: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    
  },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },  
  review: { type: mongoose.Schema.Types.ObjectId, ref: "Review" }, 
  location: {
    type: {
      type: String,
      enum: ["Point"], // Only "Point" is allowed
     
    },
    coordinates: {
      type: [Number], // Array of [longitude, latitude]
      
    },
  },
}, {
  timestamps: true, // Automatically creates 'createdAt' and 'updatedAt'
});

// Add a geospatial index for the location field
bookingSchema.index({ location: "2dsphere" });

export const Booking = mongoose.model("Booking", bookingSchema);
