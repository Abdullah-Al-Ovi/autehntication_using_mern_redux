import User from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import bcryptjs from 'bcryptjs';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const test = (req, res) => {
  res.json({
    message: 'API is working!',
  });
};

// update user

export const updateUser = asyncHandler(async (req, res) => {
  console.log(req.body);

  const fileUrl = "http://localhost:8080";
  let fileUrlWithPath = "";

  // If a file is uploaded, update profile picture URL
  if (req.file) {
    fileUrlWithPath = `${fileUrl}/images/${req.file.filename}`;
  }

  // Check if the user is authorized to update this account
  if (req.user.id !== req.params.id) {
    throw new ApiError(401, "You can update only your account!");
  }

  // Hash the password if provided
  if (req.body.password) {
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }

  // Normalize the interests field
  let { interests } = req.body;
  if (!interests) {
    interests = []; // If interests is missing, set it to an empty array
  } else if (typeof interests === "string") {
    interests = [interests]; // Convert single string to an array
  } else if (!Array.isArray(interests)) {
    interests = []; // Fallback for invalid input types
  }

  // Prepare update data
  const updateData = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    profilePicture: fileUrlWithPath || req.body.profilePicture, // Keep old profile picture if no new file
    gender: req.body.gender,
    interests, // Always an array now
    country: req.body.country,
  };

  // Update user in the database
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true }
  );

  // Remove password from the response
  const { password, ...rest } = updatedUser._doc;

  return res.status(200).json(new ApiResponse(200, rest, "User has been updated..."));
});



// delete user


export const deleteUser = asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) {
    throw new ApiError(401, 'You can delete only your account!');
  }
  await User.findByIdAndDelete(req.params.id);
 return res.status(200).json(new ApiResponse(200, null, 'User has been deleted...'));

})