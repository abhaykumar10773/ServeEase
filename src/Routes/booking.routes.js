import { Router } from "express";
import { verifyJWT } from "../Middlewares/auth.middlewares.js";
import { searchServiceProviders ,Bookprovider,getAllUserBookings,getAllProviderBookings,AcceptBooking,RejectBooking,CompleteBooking } from "../Controllers/booking.controllers.js"

const router = Router();
    

router.route("/searchServiceProviders",searchServiceProviders).post(searchServiceProviders);
router.route("/Bookprovider").post(verifyJWT,Bookprovider);
router.route("/getAllUserBookings").get(verifyJWT,getAllUserBookings);
router.route("/getAllProviderBookings").get(verifyJWT,getAllProviderBookings);
router.route("/AcceptBooking",AcceptBooking).post(AcceptBooking);
router.route("/RejectBooking",RejectBooking).post(RejectBooking);
router.route("/CompleteBooking",CompleteBooking).post(CompleteBooking);

export default router;
