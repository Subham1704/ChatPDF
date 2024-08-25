import users from "../models/user.js";
import bcrypt from "bcrypt"

export const postSignup=async(req,res,next)=>{
    const {password,email,username}=req.body;
    const givenFields=Object.keys(req.body);
    const requiredFields=['password','email','username'];
    const missingFields=requiredFields.filter((field)=>!givenFields.includes(field));
    if(missingFields.length!=0){
        throw new Error(`Provide the following fields:${missingFields.join(',')}`);
    }
    let existingUser=await users.findOne({
        $or:[
            {username},
            {email}
        ]
    })
    if(existingUser){
        console.log(2);
        console.log(existingUser);
        throw new Error('a user with this username or email already exists');
    }
    try {
        console.log(1);
        let newUser=await users.create({
            username,
            password,
            email
        })
        let newUser1=await users.findOne({
            $or:[
                {username},
                {email}
            ]
        }).select("-password")
        res.status(200).json({
            success:true,
            message:"user created successfully",
            user:newUser1
        })
    } catch (error) {
        throw new Error('error while creating new user')
    }
}
export const postLogin=async(req,res,next)=>{
    const {username,email,password}=req.body;
    if(!username && !email){
        throw new Error('provide username or email for login')
    }
    console.log(username);
    let user1=await users.findOne({
        $or:[
            {username},
            {email}
        ]
    })
    
    if(!user1){
        throw new Error('no user with this username or email exists')
    }
    console.log(user1.username);
    // let isPasswordCorrect;
    // bcrypt.compare(password,user1.password,(err,result)=>{
    //     if(err){
    //         console.log(err);
    //     }
    //     isPasswordCorrect=result;
    // })
    let isPasswordCorrect=await user1.checkPassword(password);
    // let isPasswordCorrect=await bcrypt.compare(password,user1.password);
    console.log(password);
    console.log(isPasswordCorrect);
    if(!isPasswordCorrect){
        throw new Error('the given password is incorrect');
    }
    const token=await user1.generateToken();
    res.status(200)
    .cookie("jwt", token, { path: '/', SameSite: 'None', Secure: true  })
    .json({
        success:true,
        message:"logged in successfully"
    })
}

