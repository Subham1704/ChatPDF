import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

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

const userSchema=new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password:{
        type:String,
        required:true
    },   
    filesUploaded:[{
        type:String
    }],
    currentFileText:[
        documentSchema
    ],
    currentFileName:{type:String}
})

userSchema.pre('save',async function(next){

    if(!this.isModified("password")){
        return next();
    }
    const user=this;
    try {
        const hash=await bcrypt.hash(user.password,10);
        user.password=hash;
        console.log(user);
        next();
    } catch (error) {
        return next(err);
    }
})
userSchema.methods.checkPassword=async function(password1){
    const isMatch=await bcrypt.compare(password1,this.password);
    return isMatch;
}
userSchema.methods.generateToken=async function(){
    return jwt.sign(
        {
            userId:this._id,
            username:this.username
        },
        process.env.TOKEN_KEY,
        {
            expiresIn:process.env.TOKEN_EXPIRY
        }
    );
}

const user=mongoose.model('User',userSchema);
export default user;