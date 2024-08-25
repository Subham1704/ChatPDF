import mongoose, { Schema } from "mongoose";
import { ObjectId } from "mongodb";
const chatHistory=new Schema({
    userId:{
        type:ObjectId
    },
    pdfName:{
        type:String
    },
    messages:[{
        AI:{type:String,required:true},
        Human:{type:String,required:true},
        // messages:{type:String,required:true},
        timestamp:{type:Date,default:Date.now()}
    }]
})
const ChatHistory=mongoose.model('chatHistory',chatHistory);
export default ChatHistory;