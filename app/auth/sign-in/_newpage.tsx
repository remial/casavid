import { signIn, getProviders, ClientSafeProvider, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation'; 
import React, { useState, useEffect } from 'react';

import Image from 'next/image';
import home from "@/public/picfixaiw.png"; 
import { track } from '@vercel/analytics';
import GTagEvent from "@/components/GTagEvent";

const SignIn: React.FC = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' }); 
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider>>();
  const [errorMessage, setErrorMessage] = useState('');
  const [tagEvent, setTagEvent] = useState(false); // State to control the rendering of ConversionTracking
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const setAuthProviders = async () => {
      const res = await getProviders();
      if (res) {
        setProviders(res);
      }
    };

    setAuthProviders();

    if (session) {
      router.push('/'); 
    }
  }, [session, router]);

  const handleCredentialChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [event.target.name]: event.target.value
    });
  };

  const handleCredentialsSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      email: credentials.email,
      password: credentials.password,
    });
    if (result?.ok) {
      window.location.href = '/'; //this is to force a page refresh
    } else {
      setErrorMessage('Failed to sign in. Please check your credentials or use the Sign Up page to create account if new.');
    }
  };

  const handleOAuthSignIn = (providerId: string) => {
    signIn(providerId, { callbackUrl: `${window.location.origin}/adventures` });
    if (providerId === 'google') {
      // Assume a Google sign-in attempt should trigger the conversion tracking
      setTagEvent (true);
      track('Google Sign In');
    }
  };

  if (!providers) {
    return <div>Loading...</div>; // Or some loading indicator
  }


  return (
    <div className="py-20 px-5">
        {tagEvent && <GTagEvent />}
      
      <div className="signin-container max-w-md mx-auto my-10 p-4 border rounded-xl shadow-lg bg-white">
      <div className="logo flex justify-center items-center mb-6 rounded-full">
        <p className="text-bold text-blue-800 font-bold">Sign in to continue the Adventure</p>
        {/*<Image src={home} className="rounded-full" alt="Website Logo" width={120} height={120} />*/}
      </div>
      <div className="flex justify-center">
        {providers.google && (
          <button
          onClick={() => {
            track('Google Sign In'); 
            handleOAuthSignIn('google'); 
          }}
          className="flex items-center gsi-material-button rounded-lg"
        > 
            
  <div className="gsi-material-button-state"></div>
  <div className="gsi-material-button-content-wrapper">
    <div className="gsi-material-button-icon">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"  >
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
      </svg>
    </div>
    <span className="gsi-material-button-contents">Continue with Google</span>
    </div>
  

          </button>
        )}
      </div>
            {errorMessage && (
        <div className="text-red-500 text-center mb-4">{errorMessage}</div>
      )}
       {/* <form onSubmit={handleCredentialsSignIn} className="space-y-4 mt-6">
        <input
          type="text"
          name="email"
          placeholder="Email"
          value={credentials.email}
          onChange={handleCredentialChange}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleCredentialChange}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button type="submit" className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded w-full">
          Sign In
        </button>
      </form>
       ... rest of your component ... 
      <div className="flex justify-between mt-6 text-sm text-blue-600">
        <a href="/auth/signup">Sign Up</a>
        <a href="/auth/forgot-password">Forgot Password?</a>
      </div>*/}
      <div className="small-links mt-4 text-xs text-gray-500">
        By signing in and continuing to use this service, you agree to the 
        <a href="/terms-conditions" className="text-blue-400"> Terms & Conditions</a> and 
        <a href="/privacy-policy" className="text-blue-400"> Privacy Policy</a>.
    </div>
    </div></div>
  );
};

export default SignIn;
