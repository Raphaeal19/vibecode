import { authModalState } from '@/atoms/authModalAtom';
import React, { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { auth } from '@/firebase/firebase';
import { toast } from 'react-toastify';

type SignupProps = {

};

const Signup: React.FC<SignupProps> = () => {
  const setAuthModalState = useSetRecoilState(authModalState);
  const handleClick = (type: 'login' | 'register') => {
    setAuthModalState((prev) => ({
      ...prev,
      type: type,
    }));
  };

  const [inputs, setInputs] = React.useState({
    email: '',
    displayName: '',
    password: '',
  });

  const [
    createUserWithEmailAndPassword,
    user,
    loading,
    error,
  ] = useCreateUserWithEmailAndPassword(auth);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle registration logic here
    if (!inputs.email || !inputs.password || !inputs.displayName) 
        return toast.error("Please fill all fields", {position: 'top-center', autoClose: 4000, hideProgressBar: true, closeOnClick: true, theme: 'dark'});
    try {
      const newUser = await createUserWithEmailAndPassword(inputs.email, inputs.password);
      if (!newUser) return;
      router.push('/'); // Redirect to home page after successful registration
    } catch (error: any) {
      toast.error('Error creating user: ' + error.message, {position: 'top-center', autoClose: 4000, hideProgressBar: true, closeOnClick: true, theme: 'dark'});
    }
  };
  

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (error) {
      toast.error('Error: ' + error.message, {position: 'top-center', autoClose: 4000, hideProgressBar: true, closeOnClick: true, theme: 'dark'});
    }
  }, [user, error, router]);

  return (
    <form className='space-y-6 px-6 pb-4' onSubmit={handleRegister}>
      <h3 className='text-xl font-medium text-white'>Register to VibeCode</h3>
      <div>
        <label htmlFor='email' className="text-sm font-medium block mb-2 text-gray-300">
          Email
        </label>
        <input type='email' id='email' name='email' placeholder='Enter your email' onChange={handleChangeInput}
          className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
          bg-gray-600 border-gray-500 placeholder-gray-400 text-white' />
      </div>
      <div>
        <label htmlFor='displayName' className="text-sm font-medium block mb-2 text-gray-300">
          Display Name
        </label>
        <input type='displayName' id='displayName' name='displayName' placeholder='Enter your handle' onChange={handleChangeInput}
          className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
          bg-gray-600 border-gray-500 placeholder-gray-400 text-white' />
      </div>

      <div>
        <label htmlFor='password' className="text-sm font-medium block mb-2 text-gray-300">
          Password
        </label>
        <input type='password' id='password' name='password' placeholder='Enter your password' onChange={handleChangeInput}
          className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
          bg-gray-600 border-gray-500 placeholder-gray-400 text-white' />
      </div>
      <button type='submit' className='w-full text-white focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center
      bg-brand-orange hover:bg-brand-orange-s'>
        {loading ? 'Registering...' : 'Register'}
      </button>
      <div className='text-sm font-medium text-gray-300'>
        Already have an account?{" "}
        <a href="#" className='text-blue-700 hover:underline' onClick={() => handleClick("login")}>Login</a>
      </div>
    </form>

  );
}
export default Signup;