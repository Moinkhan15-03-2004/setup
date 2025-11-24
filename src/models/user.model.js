import mongoose ,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrpt from "bcrypt";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true,

    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
       type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    avatar:{
        type: String,
        required:true,
    },
    coverImage:{
        type:String,// cloudinary url
    },
    watchHistory:[{
       
            type: Schema.Types.ObjectId,
            ref: "Video",
      
        
    }],
    password :{
        type: String,
        required: true
    },

    refreshToken :{
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
 userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();// baar baar password change n ho
    this.password = await bcrpt.hash(this.password,10)
    next();
 })
 userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrpt.compare(password,this.password)
 }
 userSchema.methods.generateAccessToken = function(){
    jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email,
        fullname: this.fullname,
    
    },process.env.ACCESS_TOKEN_SECRET,{ACCESS_TOKEN_EXPIRY:"1d"})
 }
 userSchema.methods.generateRefreshToken = function(){
    jwt.sign({
        _id: this._id,
    },process.env.REFRESH_TOKEN_SECRET,{REFRESH_TOKEN_EXPIRY:"7d"})
 }

export const User = mongoose.model("User", userSchema);