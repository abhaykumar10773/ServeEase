import { Router } from "express";
import { verifyJWT } from "../Middlewares/auth.middlewares.js";

const router = Router();
import { registerService} from "../Controllers/service.controller.js"

router.route("/registerService").post(verifyJWT,registerService);

export default router;