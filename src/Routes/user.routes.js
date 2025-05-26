import { Router } from "express";
import multer from "multer";
import { upload } from "../Middlewares/multer.middleware.js";
import { verifyJWT } from "../Middlewares/auth.middlewares.js";
import { login,
     logout, 
     registerUser,
    resetpassword, 
     searchprovider,
    updateaccount,
    UpdateProfileimg,
    changepassword,
    Getuserprofile,
    getuserdetails,
    refreshAccessToken,
    Forgotpassword, 
    registerProvider} from "../Controllers/user.controllers.js";


const router = Router();

router.route("/register").post(registerUser);
router.route("/registerProvider").post(registerProvider)
//  router.use(verifyJWT)
 router.route("/login",login).post(login);
 router.route("/logout",logout).post(verifyJWT,logout);
 router.route("/changepassword",changepassword).put(verifyJWT,changepassword);
 router.route("/updateaccount",updateaccount).put(verifyJWT,updateaccount);
 router.route("/UpdateProfileimg",UpdateProfileimg).post(verifyJWT,
    upload.fields([
        {
            name:"profileimg",
            maxcount:1
        }
    ]),
    UpdateProfileimg);
 router.route("/Getuserprofile",Getuserprofile).get(verifyJWT,Getuserprofile);
 router.route("/getuserdetails/:id",getuserdetails).get(getuserdetails);
 router.route("/refreshAccessToken",refreshAccessToken).get(verifyJWT,refreshAccessToken);
 router.route("/Forgotpassword",Forgotpassword).post(verifyJWT,Forgotpassword);
 router.route("/resetpassword",resetpassword).post(verifyJWT,resetpassword);
 router.route("/searchprovider",searchprovider).post(verifyJWT,searchprovider);


export default router;