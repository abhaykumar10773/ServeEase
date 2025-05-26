import { User } from "../models/user.model.js";
import { Service } from "../models/service.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";


// const registerService = asyncHandler( async (req, res) => {
    
//         const { name, description, price, category, serviceArea } = req.body;

//         // Find the provider by ID
//         const userid = req?._id;
//         const provider = await User.findById(userid);
//         console.log(provider)
//         if (!provider || provider.role !== "provider") {
//             return res.status(400).json({ message: "Invalid provider ID" });
//         }

//         // Create the new service linked to the provider
//         const newService =  Service.create({
//             name,
//             description,
//             price,
//             category,
//             provider: userid,  // Link the service to the provider
//             serviceArea,
//         });

//         // Save the service to the database
//         await newService.save();

//         // Add this service to the provider's list of services offered
//         provider.servicesOffered.push(newService._id);
//         await provider.save();

//         return res
//         .status(201)
//         .json(new ApiResponse(
//             200,
//              "Service registered successfully!",{newService}));

   
// });

const getCoordinatesFromLocation = async (locationName) => {
    const hereApiKey = "74sDSdKcPruzGToHytQmhNHCSZ-3AJA_OGtH9KjNMTc"; 
    const geocodingURL = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
      locationName
    )}&apikey=${hereApiKey}`;
  
    const response = await axios.get(geocodingURL);
  
    if (response.data.items && response.data.items.length > 0) {
      const { lat, lng } = response.data.items[0].position;
      return { latitude: lat, longitude: lng };
    } else {
      throw new Error("Unable to get coordinates for the given location.");
    }
  };
  
  // @desc    Register Service for a Provider
  // @route   POST /api/services/register
  // @access  Private (Only for providers)
  const registerService = asyncHandler(async (req, res) => {
    const { category,price,  description, address, radius } = req.body;
    const providerId = req._id; // Assuming provider is authenticated
  console.log("providerid is ",providerId);
    // Validate input
    if (!category || !price || !category|| !description || !address || !radius) {
      res.status(400);
      throw new Error("Please provide all required fields: serviceName, serviceDescription, address, and radius.");
    }
  
    // Convert address to latitude and longitude
    const { latitude, longitude } = await getCoordinatesFromLocation(address);
  
    // Create a new service
    const newService = await Service.create({
      
        description,
      category,
      price,
      serviceArea: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      radius, // Service radius in kilometers
      provider: providerId,
    });
  
    if (!newService) {
      res.status(500);
      throw new Error("Failed to register the service.");
    }
  
    res.status(201).json({
      message: "Service registered successfully!",
      data: newService,
    });
  });
  
  
export {
    registerService
}