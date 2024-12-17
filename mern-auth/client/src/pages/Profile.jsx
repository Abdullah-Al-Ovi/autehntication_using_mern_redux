import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOut,
} from '../redux/user/userSlice';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Profile() {
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const [formData, setFormData] = useState({});
  const [image, setImage] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  const { currentUser, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (currentUser?.data) {
      setFormData({
        username: currentUser.data.username,
        email: currentUser.data.email,
        gender: currentUser.data.gender,
        interests: currentUser.data.interests,
        country: currentUser.data.country,
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (id === 'profilePicture') {
      setImage(e.target.files[0]);
    } else if (type === 'checkbox') {
      setFormData((prevData) => ({
        ...prevData,
        interests: checked
          ? [...(prevData.interests || []), value]
          : (prevData.interests || []).filter((interest) => interest !== value),
      }));
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());

      const formDataToSend = new FormData();
      for (const key in formData) {
        if (key === 'interests') {
          (formData[key] || []).forEach((interest) => {
            formDataToSend.append('interests', interest);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
      if (image) {
        formDataToSend.append('profilePicture', image);
      }

      const res = await fetch(`/api/user/update/${currentUser?.data?._id}`, {
        method: 'PUT',
        body: formDataToSend,
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data));
        toast.error(data.message || 'Something went wrong!');
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      toast.success('Profile updated successfully!');
    } catch (error) {
      dispatch(updateUserFailure(error));
      toast.error(error.message || 'Something went wrong!');
    }
  };

  const handleDeleteAccount = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, remove`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          dispatch(deleteUserStart());
          const res = await fetch(`/api/user/delete/${currentUser?.data?._id}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (data.success === false) {
            dispatch(deleteUserFailure(data));
            toast.error(data.message || 'Something went wrong!');
            return;
          }
          dispatch(deleteUserSuccess(data));
          toast.success('Account deleted successfully!');
        } catch (error) {
          dispatch(deleteUserFailure(error));
          toast.error(error.message || 'Something went wrong!');
        }
      }
    });
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout');
      dispatch(signOut())
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
          onChange={(e) => setImage(e.target.files[0])}
        />
        <img
          src={formData?.profilePicture || currentUser?.data?.profilePicture}
          alt='profile'
          className='h-24 w-24 self-center cursor-pointer rounded-full object-cover mt-2'
          onClick={() => fileRef.current.click()}
        />
        <input
          defaultValue={formData.username}
          type='text'
          id='username'
          placeholder='Username'
          className='bg-slate-100 rounded-lg p-3'
          onChange={handleChange}
        />
        <input
          defaultValue={formData.email}
          type='email'
          id='email'
          placeholder='Email'
          className='bg-slate-100 rounded-lg p-3'
          onChange={handleChange}
        />
        <div>
          <label>Gender:</label>
          <div>
            <input
              type='radio'
              id='gender'
              name='gender'
              value='male'
              checked={formData.gender === 'male'}
              onChange={handleChange}
            />
            <label htmlFor='male'>Male</label>
          </div>
          <div>
            <input
              type='radio'
              id='gender'
              name='gender'
              value='female'
              checked={formData.gender === 'female'}
              onChange={handleChange}
            />
            <label htmlFor='female'>Female</label>
          </div>
        </div>
        <div>
          <label>Interests:</label>
          <div>
            <input
              type='checkbox'
              id='interests'
              value='coding'
              checked={formData.interests?.includes('coding')}
              onChange={handleChange}
            />
            <label htmlFor='coding'>Coding</label>
          </div>
          <div>
            <input
              type='checkbox'
              id='interests'
              value='music'
              checked={formData.interests?.includes('music')}
              onChange={handleChange}
            />
            <label htmlFor='music'>Music</label>
          </div>
          <div>
            <input
              type='checkbox'
              id='interests'
              value='sports'
              checked={formData.interests?.includes('sports')}
              onChange={handleChange}
            />
            <label htmlFor='sports'>Sports</label>
          </div>
        </div>
        <div>
          <label htmlFor='country'>Country:</label>
          <select id='country' value={formData.country} onChange={handleChange}>
            <option value='BD'>Bangladesh</option>
            <option value='USA'>USA</option>
            <option value='UK'>UK</option>
          </select>
        </div>
        <input
          type='password'
          id='password'
          placeholder='Password'
          className='bg-slate-100 rounded-lg p-3'
          onChange={handleChange}
        />
        <button className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
          {loading ? 'Loading...' : 'Update'}
        </button>
      </form>
      <div className='flex justify-between mt-5'>
        <span
          onClick={handleDeleteAccount}
          className='text-red-700 cursor-pointer'
        >
          Delete Account
        </span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>
          Sign out
        </span>
      </div>
    </div>
  );
}
