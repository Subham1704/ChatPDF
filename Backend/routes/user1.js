import express from 'express';
import { getChatHistory, loader1, multiplePdfs, uploadSinglePdf } from '../controllers/user2.js';
import upload, { upload1 } from '../utils/multer.js';
import fs from 'fs'
import jwt from "jsonwebtoken"
const router=express.Router();
import { postLogin, postSignup } from "../controllers/auth.js";
import { getText,  uploadStorage } from '../controllers/FileUpload.js';
import user from '../models/user.js';
import { postAns, storeVectors } from '../controllers/user3.js';
import vectorStore from '../models/vectordbs.js';
import extractedText from '../models/ExtractedText.js';
import ChatHistory from '../models/chatHistory.js';

router.post('/postSignup',postSignup);
router.post('/postLogin',postLogin);


router.post('/uploadSinglePdf',upload1.single('file'),async(req,res)=>{
    const token=req.cookies.jwt;
    console.log(req.cookies);
    if(!token){
        throw new Error('Unauthorized')
    }
    const decoded=await jwt.verify(token,process.env.TOKEN_KEY);
    const user1=await user.findById(decoded.userId);
    const file=req.file;
    console.log(file);
    const fileName=file.originalname;
    try {
        const splittedDocs=await uploadStorage(fileName);
        user1.filesUploaded.push(fileName);
        user1.currentFileText=splittedDocs;
        user1.currentFileName=fileName;
        await user1.save();
        const extractedText1=await extractedText.create({
            splittedDocs,
            userId:user1._id,
            pdfName:fileName
        })
        const chatHist=await ChatHistory.create({
            userId:user1._id,
            pdfName:fileName
        })
        res.send("successfully uploaded");

    } catch (error) {
        console.log(error);
    }
})
router.post('/postAns',postAns)

router.post('/changeFile',async(req,res,next)=>{
    const token=req.cookies.jwt;
    if(!token){
        throw new Error('Unauthorized')
    }
    const decoded=await jwt.verify(token,process.env.TOKEN_KEY);
    const user1=await user.findById(decoded.userId);
    const {fileName}=req.body;
    console.log(fileName);
    const extractedText1=await extractedText.findOne({
        userId:user1._id,
        pdfName:fileName,
    })
    // console.log(extractedText1);
    user1.currentFileName=fileName;
    user1.currentFileText=extractedText1.splittedDocs;
    await user1.save();
    res.send('successfully changed the pdf');
});

router.get('/getFileName',async(req,res)=>{
    const token=req.cookies.jwt;
    console.log(req.cookies.jwt);
    if(!token){
        throw new Error('Unauthorized')
    }
    const decoded=await jwt.verify(token,process.env.TOKEN_KEY);
    const user1=await user.findById(decoded.userId);
    console.log(user1.currentFileName);
    res.send(user1.currentFileName);
})

router.get('/getChatHistory',async(req,res,next)=>{
    const token=req.cookies.jwt;
    console.log(req.cookies.jwt);
    if(!token){
        throw new Error('Unauthorized')
    }
    const decoded=await jwt.verify(token,process.env.TOKEN_KEY);
    const user1=await user.findById(decoded.userId);
    const chatHist=await ChatHistory.findOne({
        userId:user1._id,
        pdfName:user1.currentFileName
    })
    if(!chatHist){
        throw new Error('error while getting chat history')
    }
    res.send(chatHist.messages);
})

router.get('/getFileList',async(req,res,next)=>{
    const token=req.cookies.jwt;
    console.log(req.cookies.jwt);
    if(!token){
        throw new Error('Unauthorized')
    }
    const decoded=await jwt.verify(token,process.env.TOKEN_KEY);
    const user1=await user.findById(decoded.userId);
    console.log(user1.filesUploaded);
    res.send(user1.filesUploaded);
})


export default router;