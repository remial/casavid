"use client"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger } from "./ui/dropdown-menu";
import React from 'react';
import UserAvatar from './UserAvatar';

import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { getPortalUrl } from "@/app/_account/stripePayment";
import { app } from "@/firebase";

import { getFunctions, httpsCallable } from 'firebase/functions';
import { FaRegUserCircle } from "react-icons/fa";
import { Button } from "./ui/button";


interface UserAvatarWrapperProps {
  name: string;
  image?: string | null;
}

export const dynamic = 'force-dynamic';

function UserAvatarWrapper({ name, image }: UserAvatarWrapperProps) {
  return (
    <>
      {image ? (
        <UserAvatar name={name} image={image} />
      ) : (
        <FaRegUserCircle size={40}/>
      )}
    </>
  );
}

// firebaseApp is object created using initializeApp()
// may need to change server location
const functions = getFunctions(app, 'europe-west2');
const createPortalLink = httpsCallable(
functions, 
'ext-firestore-stripe-payments-createPortalLink');

interface PortalLinkResponse {
url: string;
}

// request Stripe to create a portal link, and redirect user there
const handleBillingClick = () => {
createPortalLink({
    returnUrl: window.location.origin // can set this to a custom page
}).then((result) => {
    const data = result.data as PortalLinkResponse;
    window.location.assign(data.url);
}).catch((error) => {
    // handle error
});
}

function UserButton({session}: { session: Session | null}) {
  if (!session) return(
      <Button variant={"ghost"} className="text-sm bg-green-600 rounded-full text-white" onClick={() => signIn ( undefined, { callbackUrl: '/dashboard' })}>
       Login / Sign Up
      </Button>
  );

return session && (
  <div>
      <DropdownMenu>
            <DropdownMenuTrigger>
            <UserAvatarWrapper name={session.user?.name || ''} image={session.user?.image} />
           </DropdownMenuTrigger>
           <DropdownMenuContent className="w-60 h-35 flex flex-col items-start bg-white">
            <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-primary text-center text-lg text-green-700 overflow-hidden text-ellipsis">{session.user?.name || session.user?.email}</DropdownMenuLabel>
              {/* <DropdownMenuLabel className="text-primary text-center text-sm text-green-500 overflow-hidden text-ellipsis"><span className="text-gray-900">Credits Left:</span> {session.user?.credits}</DropdownMenuLabel>
             session.user?.isSubscribed && (
                <DropdownMenuItem className="font-bold cursor-pointer text-gray-500" onClick={handleBillingClick}> Manage Billing </DropdownMenuItem>
              
              <DropdownMenuItem className="font-bold cursor-pointer text-gray-700" onClick={() => window.location.href = '/settings'}> Settings </DropdownMenuItem>*/}
              
              {session.user?.isSubscribed && (
                <DropdownMenuItem className="font-bold cursor-pointer text-gray-700" onClick={() => window.location.href = '/subscriptions'}> Billing </DropdownMenuItem>
              )}
           
              <DropdownMenuItem className="font-bold cursor-pointer text-gray-700" onClick={() => signOut ({ callbackUrl: '/' })}> Log Out </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
  </div>
)
}

export default UserButton
