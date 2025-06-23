import { authModalState } from '@/atoms/authModalAtom';
import React, { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/firebase';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';


type LoginProps = {

};

const Login: React.FC<LoginProps> = () => {
  const setAuthModalState = useSetRecoilState(authModalState);
  const handleClick = (type: "login" | "register" | "forgotPassword") => {
    setAuthModalState((prev) => ({
      ...prev,
      type
    }));
  };

  const [inputs, setInputs] = useState({ email: '', password: '' });

  const [
    signInWithEmailAndPassword,
    user,
    loading,
    error,
  ] = useSignInWithEmailAndPassword(auth);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const router = useRouter();
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputs.email || !inputs.password) {
      return toast.error("Please fill all fields", {position: 'top-center', autoClose: 4000, hideProgressBar: true, closeOnClick: true, theme: 'dark'});
    }
    try {
      const user = await signInWithEmailAndPassword(inputs.email, inputs.password);
      if (!user) return;
      router.push('/');
    } catch (error:any) {
      toast.error('Error logging in: ' + error.message, {position: 'top-center', autoClose: 4000, hideProgressBar: true, closeOnClick: true, theme: 'dark'});
    }
  };

  useEffect(() => {
    if (error) {
      toast.error('Error logging in: ' + error.message, {position: 'top-center', autoClose: 4000, hideProgressBar: true, closeOnClick: true, theme: 'dark'});
    }
  }, [error]);

  return (
    <form className='space-y-6 px-6 pb-4' onSubmit={handleLogin}>
      <h3 className='text-xl font-medium text-white'>Sign in to VibeCode</h3>
      <div>
        <label htmlFor='email' className="text-sm font-medium block mb-2 text-gray-300" >
          Your Email
        </label>
        <input type='email' id='email' name='email' placeholder='Enter your email'
          className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
          bg-gray-600 border-gray-500 placeholder-gray-400 text-white' onChange={handleInputChange} />
      </div>

      <div>
        <label htmlFor='password' className="text-sm font-medium block mb-2 text-gray-300">
          Your Password
        </label>
        <input type='password' id='password' name='password' placeholder='Enter your password'
          className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
          bg-gray-600 border-gray-500 placeholder-gray-400 text-white' onChange={handleInputChange} />
      </div>
      <button type='submit' className='w-full text-white focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center
      bg-brand-orange hover:bg-brand-orange-s'>
        {loading ? "Loading..." : "Login"}
      </button>
      <button className='flex w-full justify-end'>
        <a href="#" className='text-sm block text-brand-orange hover:underline w-full text-right'
        onClick={() => handleClick("forgotPassword")}>Forgot Password?</a>
      </button>
      <div className='text-sm font-medium text-gray-300'>
        Not Registered?
        <a href="#" className='text-blue-700 hover:underline' onClick={() => handleClick("register")}> Create an account</a>
      </div>
    </form>
  );
}
export default Login;