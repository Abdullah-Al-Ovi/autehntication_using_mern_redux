import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SignUp() {
  const [formData, setFormData] = useState({
    interests: [], // Initialize interests as an empty array
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
  
    if (id === 'profilePicture') {
      setProfilePicture(e.target.files[0]);
    } else if (type === 'checkbox') {
      setFormData((prevData) => {
        let updatedInterests = prevData.interests || [];
  
        if (checked) {
          // Add value if checked
          updatedInterests = [...updatedInterests, value];
        } else {
          // Remove value if unchecked
          updatedInterests = updatedInterests.filter((interest) => interest !== value);
        }
  
        return { ...prevData, interests: updatedInterests };
      });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(false);
  
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (key === 'interests') {
          // Always send as an array, even if empty
          const interestsArray = Array.isArray(formData[key]) ? formData[key] : [formData[key]];
          interestsArray.forEach((interest) => formDataToSend.append('interests', interest));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
  
      if (profilePicture) {
        formDataToSend.append('profilePicture', profilePicture);
      }
  
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formDataToSend,
      });
  
      const data = await res.json();
      setLoading(false);
  
      if (!data.success) {
        toast.error(data.message || 'Something went wrong!');
        return;
      }
  
      navigate('/sign-in');
    } catch (error) {
      setLoading(false);
      toast.error(error?.message || 'Something went wrong!');
    }
  };
  
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='text'
          placeholder='Username'
          id='username'
          className='bg-slate-100 p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='email'
          placeholder='Email'
          id='email'
          className='bg-slate-100 p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='password'
          placeholder='Password'
          id='password'
          className='bg-slate-100 p-3 rounded-lg'
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
              onChange={handleChange}
            />
            <label htmlFor='coding'>Coding</label>
          </div>
          <div>
            <input
              type='checkbox'
              id='interests'
              value='music'
              onChange={handleChange}
            />
            <label htmlFor='music'>Music</label>
          </div>
          <div>
            <input
              type='checkbox'
              id='interests'
              value='sports'
              onChange={handleChange}
            />
            <label htmlFor='sports'>Sports</label>
          </div>
        </div>
        <div>
          <label htmlFor='country'>Country:</label>
          <select required id='country' onChange={handleChange}>
            <option value=''>Select Country</option>
            <option value='BD'>Bangladesh</option>
            <option value='USA'>USA</option>
            <option value='UK'>UK</option>
          </select>
        </div>
        <input
          type='file'
          id='profilePicture'
          className='bg-slate-100 p-3 rounded-lg'
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
      </form>
      <div className='flex gap-2 mt-5'>
        <p>Have an account?</p>
        <Link to='/sign-in'>
          <span className='text-blue-500'>Sign in</span>
        </Link>
      </div>
    </div>
  );
}
