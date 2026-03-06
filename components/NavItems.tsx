'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from './ui/button';

interface NavItemsProps {
  session: any;
  className?: string;
  onNavigate?: () => void;
}

const NavItems: React.FC<NavItemsProps> = ({ session, onNavigate }) => {
  return (
   
    <div className="flex items-center gap-1"> {/*
      <Link
        href="/#testimonials"
        className="text-gray-600 hover:text-blue-600"
        onClick={() => onNavigate?.()}
      >
        <Button variant="ghost" className="text-base">
          Reviews
        </Button>
      </Link>
      
      <Link
        href="/#how-it-works"
        className="text-gray-600 hover:text-blue-600"
        onClick={() => onNavigate?.()}
      >
        <Button variant="ghost" className="text-base">
          How It Works
        </Button>
      </Link>
      
      <Link
        href="/#faq"
        className="text-gray-600 hover:text-blue-600"
        onClick={() => onNavigate?.()}
      >
        <Button variant="ghost" className="text-base">
          FAQ
        </Button>
      </Link>*/}

      {session && (
        <Link
          href="/pricing"
          prefetch={false}
          className="text-gray-600 hover:text-blue-600"
          onClick={() => onNavigate?.()}
        >
          <Button variant="ghost" className="text-base">
            Pricing
          </Button>
        </Link>
      )}

      {session && (
        <Link
          href="/dashboard"
          onClick={() => onNavigate?.()}
        >
          <Button 
            className="text-base ml-2 bg-green-600 hover:bg-blue-700 text-white"
          >
            Create Video
          </Button>
        </Link>
      )}
    </div>
  );
};

export default NavItems;
