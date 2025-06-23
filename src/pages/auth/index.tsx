import { authModalState } from '@/atoms/authModalAtom';
import AuthModal from '@/components/Modals/AuthModal';
import Navbar from '@/components/Navbar/Navbar';
import { auth } from '@/firebase/firebase';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import Image from 'next/image';


type AuthPageProps = {

};

const AuthPage: React.FC<AuthPageProps> = () => {
  const authModal = useRecoilValue(authModalState);
  const [user, loading, error] = useAuthState(auth);
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/'); // Redirect to home page if user is authenticated
    if (!loading && !user) setPageLoading(false); // Set page loading to false when auth state is resolved
  }, [user, router, loading]);

  if (!pageLoading) return (<div className="bg-gradient-to-b from-gray-600 to-black h-screen relative">
    <div className="max-w-7xl mx-auto">
      <Navbar />
      <div className='flex items-center justify-center h-[calc(100vh-5rem)] pointer-events-none select-none'>
        {/* <img src="/hero.png" alt="Hero png" /> */}
        <Image src="/hero.png" alt="Hero png" width={500} height={500} className='pointer-events-none select-none' />
      </div>
      {authModal.isOpen && <AuthModal />}
    </div>
  </div>) 
  else return null; // Show nothing while loading
};
export default AuthPage;