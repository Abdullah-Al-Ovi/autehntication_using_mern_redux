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
  const fileUrl = "http://localhost:8080"; 
  let fileUrlWithPath = '';  
  if(req.file){
     fileUrlWithPath = `${fileUrl}/images/${req.file.filename}`  
  }
  if (req.user.id !== req.params.id) {
    throw new ApiError(401, 'You can update only your account!');
  }
  if (req.body.password) {
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        profilePicture: fileUrlWithPath ? fileUrlWithPath : req.body.profilePicture,
      },
    },
    { new: true }
  );
  const { password, ...rest } = updatedUser._doc;
 return res.status(200).json(new ApiResponse(200, rest, 'User has been updated...'));

})


// delete user


export const deleteUser = asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) {
    throw new ApiError(401, 'You can delete only your account!');
  }
  await User.findByIdAndDelete(req.params.id);
 return res.status(200).json(new ApiResponse(200, null, 'User has been deleted...'));

})