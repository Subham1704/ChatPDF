import { ObjectId } from "mongodb";
import mongoose, { Schema } from "mongoose";


const vectorSchema=new Schema({
    userId:{type:ObjectId},
    pdfName:{type:String},
    // vectors:[{ type: [Number] }]
    vectors:{type:Object}
})

const vectorStore=mongoose.model('vectorStore',vectorSchema);
export default vectorStore;