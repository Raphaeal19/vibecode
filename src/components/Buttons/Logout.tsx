import React from 'react';
import { FiLogOut } from 'react-icons/fi';
import { useSignOut } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/firebase';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useResetRecoilState } from 'recoil';
import { chatState } from '@/atoms/chatAtom';

type LogoutProps = {};

const Logout:React.FC<LogoutProps> = () => {
  const [signOut, loading, error] = useSignOut(auth);
  const router = useRouter();
  const resetChatState = useResetRecoilState(chatState);

  const handleLogout = async () => {
    try {
      const success = await signOut(); 
      if (success) {
        resetChatState();
        toast.success('You have been signed out successfully.', {position: 'top-center', autoClose: 4000, hideProgressBar: true, closeOnClick: true, theme: 'dark'});
      }
    }
    catch (error:any) {
      console.error('Error signing out:', error);
      toast.error('Error signing out: ' + error.message, {position: 'top-center', autoClose: 4000, hideProgressBar: true, closeOnClick: true, theme: 'dark'});
    }
  }
  return <button className='bg-dark-fill-3 py-1.5 px-3 cursor-pointer rounded text-brand-orange' onClick={handleLogout}>
    <FiLogOut />
  </button>
}
export default Logout;