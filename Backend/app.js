import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import userRouter from "./routes/user1.js";
import upload from "./utils/multer.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT =4444;
app.use(cors({
    origin:'http://localhost:3000',
    credentials: true
}))
//app.use(bodyParser);
app.use(bodyParser.json({ limit: "4kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "4kb" }));
app.use(cookieParser());
app.use('/',userRouter);
mongoose.connect('mongodb://127.0.0.1:27017/chatPdf').then(()=>{
    app.listen(PORT,()=>{
        console.log(`http://localhost:${PORT}`);
    })
})
.catch((err)=>{
    console.log(err);
})

