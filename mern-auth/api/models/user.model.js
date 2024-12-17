import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      trim: true
    },
    profilePicture: {
      type: String,
      default:
        'https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg',
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true
    },
    interests: {
      type: [String],
      default: []
    },
    country: {
      type: String,
      enum: ['BD', 'USA', 'UK'],
      required: true
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;