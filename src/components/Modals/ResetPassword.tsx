// TODO: Reset password works even if the email is not registered,
//       but it should ideally check if the email exists in the database before sending the reset link. Issue from Firebase

import { auth } from '@/firebase/firebase';
import React, { useEffect, useState } from 'react';
import { useSendPasswordResetEmail } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';

type ResetPasswordProps = {

};

const ResetPassword: React.FC<ResetPasswordProps> = () => {
  const [email, setEmail] = useState('');
  const [sendPasswordResetEmail, sending, error] = useSendPasswordResetEmail(auth);
  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await sendPasswordResetEmail(email);
    if (success){
      toast.success(
        'If an account with that email exists, a reset link has been sent.',
        {position: 'top-center', autoClose: 4000, hideProgressBar: true, closeOnClick: true, theme: 'dark'}
      );
    }
  };

  useEffect(() => { 
    if (error) {
      toast.error(`Error: ${error.message}`, {position: 'top-center', autoClose: 4000, hideProgressBar: true, closeOnClick: true, theme: 'dark'});
    }
  },[error]);

  return (
    <form className='space-y-6 px-6 lg:px-8 pb-4 sm:pb-6 xl:pb-8' onSubmit={handleReset}>
      <h3 className='text-xl font-medium text-white'>Reset Password</h3>
      <p className='text-sm text-white'>
        Forgotten your password? No worries, just enter your email below and we'll send you a link to reset it
      </p>
      <div>
        <label htmlFor='email' className="text-sm font-medium block mb-2 text-gray-300">
          Your Email
        </label>
        <input type='email' id='email' name='email' placeholder='Enter your email' 
        onChange={(e) => {setEmail(e.target.value)}}
          className=' border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
          bg-gray-600 border-gray-500 placeholder-gray-400 text-white'
        />
      </div>
      <button type='submit' className='w-full text-white focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center
        bg-brand-orange hover:bg-brand-orange-s'>
        Send Reset Link
      </button>
    </form>

  );
}
export default ResetPassword;