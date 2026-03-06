// components/ConditionalNavbar.tsx
"use client";

import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { usePathname } from 'next/navigation';

const ConditionalNavbar: React.FC = () => {
  const pathname = usePathname();

  // Define the routes where the header (Navbar) should not be displayed
  const noHeaderRoutes = ['/pricingpage'];

  if (noHeaderRoutes.includes(pathname)) {
    return null;
  }

  return (
    <Suspense fallback={<div className="flex w-full px-4 lg:px-40 py-1 items-center border-b text-center gap-8 justify-between h-[69px]" />}>
      <Navbar />
    </Suspense>
  );
};

export default ConditionalNavbar;
