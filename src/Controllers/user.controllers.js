import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from 'jsonwebtoken'
import { uploadOncloudinary } from "../utils/Cloudaniry.js";

const genrateAccessAndRefreshTokens = async(userId) =>{
    try {
         const users = await User.findById(userId)
         if (!users) {
             throw new ApiError(404, "User not found");
         }
         
         const accessToken = users.genrateAccessToken()
         const refreshToken = users.genrateRefreshToken()
          users.refreshToken = refreshToken;    // store the token
         await users.save({validateBeforeSave: false})
  
         return {accessToken,refreshToken}
  
  
    } catch(error)
    {
      console.log("error during token geration",error)
        throw new ApiError(500,"Something went wrong while generating refresh and access token ")
    }
  }

 const registerUser = asyncHandler(async (req, res) => {
  const { FullName, email, contact, password } = req.body;

  if (!FullName || !email || !contact || !password) {
    throw new ApiError(400, "All fields are required");
  }

  console.log("All ", req.body);

  // Check if user already exists
  const existUser = await User.findOne({
    $or: [{ email }, { contact }],
  });

  if (existUser) {
    throw new ApiError(400, "User is already registered, please login");
  }

  // Create new user
  const userNew = await User.create({
    FullName,
    email,
    contact,
    password,
    address:{
      street: "",
      city: "",
      state: "",
      zipcode: "",
    }
  });

  if (!userNew) {
    throw new ApiError(400, "Something went wrong while registering user");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(userNew._id);

  // Store refresh token in database
  await User.findByIdAndUpdate(userNew._id, { refreshToken });

  // Select user details without password and refresh token
  const createdUser = await User.findById(userNew._id).select("-password -refreshToken");

  // Cookie options
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  // Send response with cookies
  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user: createdUser, accessToken, refreshToken }, "User registered successfully"));
});


  const login = asyncHandler( async (req,res) => {
        
    const {email,password} = req.body;
      
    if(!email || !password){
      throw new ApiError(400,"email and password is required ")
    }
    const usernew  = await User.findOne({email});

     if(!usernew){
      throw new ApiError(400,"userr is not register")
     }

           const ispassword = await usernew.isPasswordCorrect(password);

           if(!ispassword){
                 throw new ApiError(400,"password is not match ")
           }

           const {accessToken ,refreshToken } = await genrateAccessAndRefreshTokens(usernew._id)
           
           const loggedInUser = await User.findById(usernew._id).select("-password -refreshToken")
           
          
           console.log("loggedInuser",loggedInUser)
         const option = {
           httpOnly:true,
           secure:true,
           sameSite: "None",
         }
       
         return res.
         status(200)
         .cookie("accessToken",accessToken,option)
         .cookie("refreshToken",refreshToken,option)
         .json(
           new ApiResponse(
             200,
             {
               user:loggedInUser,accessToken,refreshToken
             },
             "User logged in successfully"
           )
         )
        
       });
 
    const logout = asyncHandler(async (req, res) => {
        if (!req.users?._id) {
          return res.status(401).json({ message: "Unauthorized request" });
        }
      
        // Remove refresh token from database
        await User.findByIdAndUpdate(
          req.users._id,
          { $unset: { refreshToken: "" } },  // Use `$unset` instead of `$set`
          { new: true }
        );
      
        const options = {
          httpOnly: true, 
          secure: true,
          sameSite: "None",
          expires:new Date(0) 
        };
        // Clear cookies
        res.clearCookie("accessToken", options, );
        res.clearCookie("refreshToken",options);
    
        return res.status(200)
        .json(
          { message: "Logged out successfully" }
        );
      });
       

  const changepassword = asyncHandler(async (req,res) => { 
    const {oldpassword,newpassword} = req.body;
      
    if(!oldpassword || !newpassword){
      throw new ApiError("oldpassword is required ");
    }
       //user id find to the db
     const user = await User.findById(req.User?._id)
    console.log(user);
     if(!user){
      throw new ApiError(400,"user details not found ")
     }
     // check password by oldpassword
        const isPass = await user.isPasswordCorrect(oldpassword)

        if(!isPass){
          throw new ApiError("password is not correct check your password ")
        }
         
        user.password = newpassword;
        await user.save({validateBeforeSave: false})

        return res
        .status(200)
        .json(new ApiResponse(200,{},"user password changed successfully "))
  })

  const updateaccount = asyncHandler(async (req,res) => {
     const { FullName ,contact , street ,city,state,zipcode,gender} =req.body;
     console.log("userid",req.users._id)
   
        const user = await User.findByIdAndUpdate(
          req.users?._id,
          {
            $set:{
              FullName: FullName,
              contact: contact,
              gender: gender,
              "address.street": street,
              "address.city": city,      
              "address.state": state,    
             "address.zipcode": zipcode 
          }
          },
          {
            new:true,
            upsert:true
          }
        ).select("-password ")

        console.log("usershow",user)
      if(!user){
        throw new ApiError("user details not updated ")
      }

      return res
      .status(200)
      .json(
        new ApiResponse(200,user,"update account details successfully ")
      )
  });

  const UpdateProfileimg = asyncHandler(async (req,res) => {
         const localprofile = req.files?.profileimg[0]?.path;
         
         if(!localprofile){
          throw new ApiError("profile is required ")
         }

         const profilepic = await uploadOncloudinary(localprofile);
         if(!profilepic){
          throw new ApiError("profilepicture is required")
         }

        const updatedimg = await User.findByIdAndUpdate(
          req.users?._id,   // yha pr check krna pdega testing ke time pr 
          {
            $set:{
              profileimg:profilepic.url
            }
          },
          {
            new:true
          }
         ).select("-password")

         if(!updatedimg){
          throw new ApiError(400,"profile picture not updated")
         }
         return res
         .status(200)
         .json(
          new ApiResponse(200,{},"profile picture changed successfully")
         )
  })

  const Getuserprofile = asyncHandler(async (req,res) => {
       const userId = req.params._id;
       const userimg = await User.findById(userId).select("profileimg")
       if(!userimg){
        throw new ApiError(400,"not found profile image in the db ")
       }

      return res.status(200).json({
        message: 'User profile image retrieved successfully',
        profileImage: User.profileimg, // Assuming profileImage contains the URL or path
      });

  })

  const getuserdetails = asyncHandler(async (req,res) => {
    const userId = req.params.id;
    const userdetails = await User.findById(userId).select("FullName email contact address")
    if(!userdetails){
     throw new ApiError(400,"not found profile detials in the db ")
    }
  
    return res
    .status(200)
    .json({
      message:"profile detials succesfully fetch it ",
      Profiledetails: userdetails,
    })
  })

  const refreshAccessToken =  asyncHandler(async(req,res) => {

    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken
  
    if(!incomingRefreshToken){
      throw new ApiError(401,"unauthorized request")
    }
  
    const decodeedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    ) 
    console.log("decoded token",decodeedToken)
    const users = await User.findById(decodeedToken._id)
  
    if(!users){
      throw new ApiError(401,"Invalid refresh token")
    }
    if(incomingRefreshToken !== users.refreshToken){
      throw new ApiError(401,"refresh token is expired o used ")
    }
  
    const options = {
      httpOnly:true,
      secure:true
    }
  
   const {accessToken, newrefreshToken} = await genrateAccessAndRefreshTokens(users._id)
  
    return res.status(200)
    .cookie("accesstoken",accessToken,options)
  .cookie("refreshtoken",newrefreshToken,options)
  .json({
    statusCode: 200,
    message: "Access token refreshed",
    data: {
      accessToken,
      refreshToken: newrefreshToken
    }
  });
  })

  const Forgotpassword = asyncHandler(async (req,res) => {

  })

  const resetpassword = asyncHandler(async (req,res) => {

  })

  const searchprovider = asyncHandler(async (req,res) => {
       // isko baad mae likhna hai extra feature hai 
  })


  // providers relted controllers 

  const registerProvider = asyncHandler(async (req, res) => {
    try {
        const { FullName, email, contact, address, password, role } = req.body;

        if(!FullName || !email || !contact || !password){
          throw new ApiError(400,"all feilds are required ")
        }
         const existuser = await User.findOne({
          $or : [{email},{contact}]
        })
    
          if(existuser){
            throw new ApiError(400,"user is already register please login ")
          }
    
        // Create new user (provider)
        const newUser = await User.create({
            FullName,
            email,
            contact,
            address,
            password,
            role: "provider",  // Set role as "provider"
        })
        const created = await User.findById(newUser._id).select(
          "-password -refreshToken"
        )
        // Save the provider to the database
        await created.save();
        
        return res
        .status(201)
        .json(
          new ApiResponse(
          200, "Provider registered successfully!", {newUser}
        )
        );

    } catch (error) {
        return res.status(500).json({ message: "Error registering provider", error: error.message });
    }
});
  

 

  export { 
    registerUser,
    login,
    logout,
    changepassword,
    updateaccount,
    UpdateProfileimg,
    Getuserprofile,
    getuserdetails,
    refreshAccessToken,
    Forgotpassword,
    resetpassword,
    searchprovider,
    registerProvider

  }
