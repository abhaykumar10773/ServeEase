import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOncloudinary = async (localFilepath) => {
    try{
        if(!localFilepath) return null
        //upload the file on cloudinary 
        const response = await cloudinary.uploader.upload(localFilepath,
            {
                resource_type:"auto"
            })
            //file has been uploaded succesfully 
          //  console.log("file is uplaoded on cloudinary",response.url);
          fs.unlinkSync(localFilepath) // unlink krta hai local path ko jb file upload ho jaati hai 
            return response;

    } catch (error){
          fs.unlinkSync(localFilepath) //remote locally soved temprary file 
                                      //as the upload operation got filaed
            return null;
    }
    
}

export {uploadOncloudinary}