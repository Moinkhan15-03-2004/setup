import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


// ================== TOKENS HELPER ==================
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong");
  }
};


// ================== REGISTER USER ==================
const registerUser = asyncHandler(async (req, res) => {
  // debug
  console.log(">> incoming req.is('multipart/form-data'):", req.is && req.is("multipart/form-data"));
  console.log(">> req.body:", req.body);
  console.log(">> req.files keys:", Object.keys(req.files || {}));
  console.log(">> req.file:", req.file);

  // Accept either `fullname` or `fullName` (or name) from client
  const raw = req.body || {};
  const finalFullName = raw.fullname ?? raw.fullName ?? raw.name ?? "";
  const email = raw.email;
  const username = raw.username;
  const password = raw.password;

  console.log("Mapped fullname:", finalFullName);

  // validation (ensure no empty strings)
  if ([finalFullName, email, username, password].some((f) => !f || String(f).trim() === "")) {
    throw new ApiError(400, "ALL fields are required (fullname, email, username, password)");
  }

  // check duplicates (await!)
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    if (existedUser.username === username) throw new ApiError(409, "Username already exists");
    if (existedUser.email === email) throw new ApiError(409, "Email already exists");
    throw new ApiError(409, "User with email or username already exists");
  }

  // files
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // upload avatar
  let avatarResp;
  try {
    console.log("Uploading avatar:", avatarLocalPath);
    avatarResp = await uploadOnCloudinary(avatarLocalPath);
    console.log("Cloudinary avatar response:", avatarResp?.secure_url || avatarResp?.url);
  } catch (err) {
    console.error("uploadOnCloudinary threw:", err);
    throw new ApiError(500, "Avatar upload failed");
  }

  const avatarUrl = avatarResp?.secure_url || avatarResp?.url;
  if (!avatarUrl) {
    throw new ApiError(400, "Avatar upload failed or returned no URL");
  }

  // optional cover upload
  let coverImageUrl = "";
  if (coverImageLocalPath) {
    try {
      const cov = await uploadOnCloudinary(coverImageLocalPath);
      coverImageUrl = cov?.secure_url || cov?.url || "";
    } catch (err) {
      console.warn("cover upload failed, continuing without it:", err);
      coverImageUrl = "";
    }
  }

  // create user (use schema's `fullname`)
  try {
    const user = await User.create({
      fullname: finalFullName,
      avatar: avatarUrl,
      coverImage: coverImageUrl,
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) throw new ApiError(500, "Something went wrong");

    return res.status(201).json(new ApiResponse(200, createdUser, "User created successfully"));
  } catch (err) {
    // handle duplicate key and validation errors
    if (err.code === 11000) {
      throw new ApiError(409, "Email or username already exists");
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message).join(", ");
      throw new ApiError(400, `Validation failed: ${messages}`);
    }
    throw err;
  }
});


// ================== LOGIN USER ==================
const loginUser = asyncHandler(async (req, res) => {
  // req body
  // username or email
  // find the user
  // password check
  // access and referesh token
  // send cookie
 const { email, username, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

// ================== LOGOUT USER ==================
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});
 
 const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(401, "User not found");

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const options = { httpOnly: true, secure: true };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { accessToken, refreshToken }, "Tokens refreshed successfully"));
  } catch (error) {
    return res.status(401).json(new ApiError(401, "Invalid or expired refresh token"));
  }
});
// controllers/user.controllers.js


// 1) Change current password
// ================== CHANGE CURRENT PASSWORD ==================
// ================== CHANGE CURRENT PASSWORD ==================
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Password is incorrect");
  }

  user.password = newPassword;
  await user.save(); // pre save hook will hash

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});


// ================== GET CURRENT USER ==================
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User found successfully"));
});


// ================== UPDATE ACCOUNT DETAILS ==================
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "fullname or email is required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});


// ================== UPDATE USER AVATAR ==================
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar?.url && !avatar?.secure_url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.secure_url || avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});
// ================== UPDATE USER COVER IMAGE ==================
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image is missing");
  }

  const cover = await uploadOnCloudinary(coverImageLocalPath);

  if (!cover?.url && !cover?.secure_url) {
    throw new ApiError(400, "Error while uploading cover image");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: cover.secure_url || cover.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Cover Image updated successfully"));
});






export { registerUser, loginUser, logoutUser,refreshAccessToken,changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar,updateUserCoverImage };
