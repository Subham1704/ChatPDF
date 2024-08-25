import { ObjectId } from "mongodb";
import mongoose, { Schema } from "mongoose";
const documentSchema = new Schema({
    pageContent: {
      type: String,
      required: true
    },
    metadata: {
      type: Object,
      required: true,
      properties: {
        source: {
          type: String,
          required: true
        },
        loc: {
          type: Object 
        }
      }
    }
});
const extractedTextSchema=new Schema({
    userId:{type:ObjectId},
    pdfName:{type:String},
    splittedDocs:[documentSchema]
})

const extractedText=mongoose.model('extractedText',extractedTextSchema);
export default extractedText;