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
           <DropdownMenuContent className="w-60 flex flex-col items-start bg-white">
              {session.user?.name && (
                <DropdownMenuLabel className="text-primary text-lg text-gray-800 overflow-hidden text-ellipsis w-full">{session.user.name}</DropdownMenuLabel>
              )}
              {session.user?.email && (
                <DropdownMenuLabel className="text-xl text-green-600 overflow-hidden text-ellipsis w-full py-0">{session.user.email}</DropdownMenuLabel>
              )}
              <DropdownMenuSeparator className="w-full" />
              {session.user?.isSubscribed && (
                <DropdownMenuItem className="font-bold cursor-pointer text-gray-700" asChild>
                  <a href="https://billing.stripe.com/p/login/4gMeVe9aP0rTaw4eVbbMQ00" target="_blank" rel="noopener noreferrer">
                    Billing
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="font-bold cursor-pointer text-gray-700" onClick={() => signOut ({ callbackUrl: '/' })}> Log Out </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
  </div>
)
}

export default UserButton
