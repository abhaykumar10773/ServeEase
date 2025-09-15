import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Schema } from "mongoose";



const userSchema = new Schema(
    {
        FullName:{
            type:String,
            required:true,
            uppercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            trim:true
        },
        role:{
            type:String,
            enum: ['User', 'provider', 'admin'],
            default: 'User' , 
            
        },
        contact:{
            type:Number,
            unique:true,
        },
        gender:{
            type:String,
            default:"",
        },
        address:{
            street: { type: String,  trim: true },
            city: { type: String,  trim: true },
            state: { type: String,  trim: true },
            zipcode: { type: String,  trim: true },
    },
    servicesOffered: {
         type: Schema.Types.ObjectId,
          ref: 'Service'
    },
    // serviceArea: { type: String , coordinates: [] } ,

        password:{
            type:String,
            required:[true,"paasword is required"] 
        },
        profileimg:{
            type:String,  
        },
        refreshToken:{
            type:String,
        }
    },{
        timestamp:true
    }
);

//   userSchema.index({ serviceArea: "2dsphere" });


userSchema.pre("save" , async function (next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()   
})
   
 // create method to check the password because our password is store increpted format 
 userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// create generate access tokens 
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            
        },
          process.env.ACCESS_TOKEN_SECRET,
          {
             expiresIn: process.env.ACCESS_TOKEN_EXPIRY
          }
    )
}


userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
           
        },
          process.env.REFRESH_TOKEN_SECRET,
          {
             expiresIn: process.env.REFRESH_TOKEN_EXPIRY
          }
    )
}




export const User = mongoose.model("User",userSchema)