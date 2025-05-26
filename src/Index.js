
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { DB_NAME } from "./constant.js";

import { server } from "./app.js";

dotenv.config({       // require and import on only one use 
    path: './.env'
})




connectDB().then(() => {
    server.listen(process.env.PORT || 3000 , () => {
       console.log(`server is running at port:${process.env.PORT}`);
    }) 
})
.catch((err) => {
    console.log('Mongo db is connection failed ',err);
})