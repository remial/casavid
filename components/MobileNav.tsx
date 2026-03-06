'use client';

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import Image from 'next/image';
import { Separator } from '../components/ui/separator';
import menu from '/public/menu.svg';
import Link from 'next/link';
import { Button } from './ui/button';

interface SessionProps {
  session: any;
}

const MobileNav: React.FC<SessionProps> = ({ session }) => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="align-middle">
          <Image
            src={menu}
            alt="menu"
            width={32}
            height={32}
            className="cursor-pointer"
          />
        </SheetTrigger>
        <SheetContent className="flex flex-col gap-4 bg-white md:hidden">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">CasaVid</span>
            <span className="text-2xl">🏠</span>
          </Link>
          <Separator className="border border-gray-200" />
          
          <div className="flex flex-col gap-2">
            <Link
              href="/#testimonials"
              className="text-gray-600 hover:text-blue-600"
              onClick={() => setOpen(false)}
            >
              <Button variant="ghost" className="w-full justify-start text-base">
                Reviews
              </Button>
            </Link>
            
            <Link
              href="/#how-it-works"
              className="text-gray-600 hover:text-blue-600"
              onClick={() => setOpen(false)}
            >
              <Button variant="ghost" className="w-full justify-start text-base">
                How It Works
              </Button>
            </Link>
            
            <Link
              href="/#faq"
              className="text-gray-600 hover:text-blue-600"
              onClick={() => setOpen(false)}
            >
              <Button variant="ghost" className="w-full justify-start text-base">
                FAQ
              </Button>
            </Link>

            {session && (
              <>
                <Link
                  href="/pricing"
                  prefetch={false}
                  className="text-gray-600 hover:text-blue-600"
                  onClick={() => setOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start text-base">
                    Pricing
                  </Button>
                </Link>

                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                >
                  <Button 
                    className="w-full text-base mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Create Video
                  </Button>
                </Link>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default MobileNav;
