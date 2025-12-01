// import mongoose ,{Schema} from "mongoose";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";


// const userSchema = new Schema({
//     username: {
//         type: String,
//         required: true,
//         unique: true,
//         index: true,
//         lowercase: true,
//         trim: true,

//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         lowercase: true,
//         trim: true,
//     },
//     fullname: {
//        type: String,
//         required: true,
//         unique: true,
//         lowercase: true,
//         trim: true,
//     },
//     avatar:{
//         type: String,
//         required:true,
//     },
//     coverImage:{
//         type:String,// cloudinary url
//     },
//     watchHistory:[{
       
//             type: Schema.Types.ObjectId,
//             ref: "Video",
      
        
//     }],
//     password :{
//         type: String,
//         required: true
//     },

//     refreshToken :{
//         type: String
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
// });
// userSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;
//   this.password = await bcrypt.hash(this.password, 10);
// });


//  userSchema.methods.isPasswordCorrect = async function(password){
//     return await bcrpt.compare(password,this.password)
//  }
//  userSchema.methods.generateAccessToken = function(){
//     jwt.sign({
//         _id: this._id,
//         username: this.username,
//         email: this.email,
//         fullname: this.fullname,
    
//     },process.env.ACCESS_TOKEN_SECRET,{ACCESS_TOKEN_EXPIRY:"1d"})
//  }
//  userSchema.methods.generateRefreshToken = function(){
//     jwt.sign({
//         _id: this._id,
//     },process.env.REFRESH_TOKEN_SECRET,{REFRESH_TOKEN_EXPIRY:"7d"})
//  }

// export const User = mongoose.model("User", userSchema);
// src/models/user.model.js
// import mongoose from "mongoose";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";

// const { Schema } = mongoose;

// const userSchema = new Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//     index: true,
//     lowercase: true,
//     trim: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true,
//   },
//   fullname: {
//     type: String,
//     required: true,
//     trim: true,
//     lowercase: true,
//     // unique: true, // optional: usually fullname is not unique
//   },
//   avatar: {
//     type: String,
//     required: true,
//   },
//   coverImage: {
//     type: String, // cloudinary url
//   },
//   watchHistory: [
//     {
//       type: Schema.Types.ObjectId,
//       ref: "Video",
//     },
//   ],
//   password: {
//     type: String,
//     required: true,
//   },
//   refreshToken: {
//     type: String,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Hash password before save (correct pattern)
// userSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;
//   this.password = await bcrypt.hash(this.password, 10);
// });

// // Compare password
// userSchema.methods.isPasswordCorrect = async function (plainPassword) {
//   return await bcrypt.compare(plainPassword, this.password);
// };

// // Generate access token (return the token)
// userSchema.methods.generateAccessToken = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//       username: this.username,
//       email: this.email,
//       fullname: this.fullname,
//     },
//     process.env.ACCESS_TOKEN_SECRET,
//     { expiresIn: "1d" } // correct option key
//   );
// };

// // Generate refresh token (return the token)
// userSchema.methods.generateRefreshToken = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//     },
//     process.env.REFRESH_TOKEN_SECRET,
//     { expiresIn: "7d" }
//   );
// };

// export const User = mongoose.model("User", userSchema);
// export default User;
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  fullname: { type: String, required: true, trim: true, lowercase: true }, // keep this
  avatar: { type: String, required: true },
  coverImage: { type: String },
  password: { type: String, required: true },
  refreshToken: { type: String },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ _id: this._id, username: this.username, email: this.email, fullname: this.fullname }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

export const User = mongoose.model("User", userSchema);
export default User;
