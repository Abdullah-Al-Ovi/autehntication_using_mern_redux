import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';

import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export const signup = asyncHandler(async (req, res) => {
  console.log(req.file);
  console.log(req.body);

  // Set the file URL (default or uploaded file path)
  const fileUrl = "http://localhost:8080";
  const fileUrlWithPath = req.file
    ? `${fileUrl}/images/${req.file.filename}`
    : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

  // Destructure req.body and normalize interests
  let { username, email, password, gender, interests, country } = req.body;

  // Normalize interests
  if (!interests) {
    interests = []; // If interests is missing, make it an empty array
  } else if (typeof interests === "string") {
    interests = [interests]; // Convert a single string to an array
  } else if (!Array.isArray(interests)) {
    interests = []; // Fallback for invalid data types
  }

  // Check required fields
  if ([username, email, password, gender, country].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Username, password, email, gender, and country are required.");
  }

  // Check if user already exists
  const ifUserExist = await User.findOne({ email });
  if (ifUserExist) {
    throw new ApiError(409, "User with the same email already exists");
  }

  // Hash password
  const hashedPassword = bcryptjs.hashSync(password, 10);

  // Create and save new user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    profilePicture: fileUrlWithPath,
    gender,
    interests, // Will always be an array at this point
    country,
  });

  const savedUser = await newUser.save();

  if (!savedUser) {
    throw new ApiError(500, "User not saved");
  }

  return res.status(201).json(new ApiResponse(200, null, "User created successfully"));
});


/* async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    next(error);
  }
}; */

export const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const validUser = await User.findOne({ email });
  if (!validUser) {
    throw new ApiError(401, 'User not found');
  };
  const validPassword = bcryptjs.compareSync(password, validUser.password);
  if (!validPassword) {
    throw new ApiError(401, 'Wrong credentials');
  };
  const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
  const { password: hashedPassword, ...rest } = validUser._doc;
  console.log("validate",validUser)
  console.log("rest",rest)
  const expiryDate = new Date(Date.now() + 3600000); // 1 hour
  return res
    .cookie('access_token', token, { httpOnly: true, expires: expiryDate })
    .status(200)
    .json(new ApiResponse(200, rest, 'User signed in successfully'));
}
)

// export const google = async (req, res, next) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });
//     if (user) {
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
//       const { password: hashedPassword, ...rest } = user._doc;
//       const expiryDate = new Date(Date.now() + 3600000); // 1 hour
//       res
//         .cookie('access_token', token, {
//           httpOnly: true,
//           expires: expiryDate,
//         })
//         .status(200)
//         .json(rest);
//     } else {
//       const generatedPassword =
//         Math.random().toString(36).slice(-8) +
//         Math.random().toString(36).slice(-8);
//       const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
//       const newUser = new User({
//         username:
//           req.body.name.split(' ').join('').toLowerCase() +
//           Math.random().toString(36).slice(-8),
//         email: req.body.email,
//         password: hashedPassword,
//         profilePicture: req.body.photo,
//       });
//       await newUser.save();
//       const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
//       const { password: hashedPassword2, ...rest } = newUser._doc;
//       const expiryDate = new Date(Date.now() + 3600000); // 1 hour
//       res
//         .cookie('access_token', token, {
//           httpOnly: true,
//           expires: expiryDate,
//         })
//         .status(200)
//         .json(rest);
//     }
//   } catch (error) {
//     next(error);
//   }
// };

export const signout = (req, res) => {
 return res.clearCookie('access_token').status(200).json(new ApiResponse(200, null, 'User signed out successfully'));
};
