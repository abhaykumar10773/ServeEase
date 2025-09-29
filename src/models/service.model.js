import mongoose, { Schema } from "mongoose";


const serviceSchema= new Schema(
    {
        category: {
            type: String, // Example: "Cleaning", "Plumbing", etc.
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
    
        provider: {
            type: Schema.Types.ObjectId,
            ref: "User", // Link to the provider who offers the service
          
        },
       serviceArea: {
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
},
          radius: {
            type: Number, // Radius in kilometers
            required: true,
          },
    }, {
        timestamps: true,
    }
);

serviceSchema.index({ serviceArea: "2dsphere" });

export const Service = mongoose.model("Service", serviceSchema);