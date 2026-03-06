import Link from "next/link";
import Image from "next/image";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import UserButton from "./UserButton";
import MobileNav from "./MobileNav";
import NavItems from "./NavItems";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-wrap w-full px-4 lg:px-8 items-center text-center gap-4 justify-between bg-white py-3">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center">
          <Image
            src="/homespg.png"
            alt="CasaVid"
            width={150}
            height={80}
            className="h-10 w-auto"
            priority
          />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center">
          <NavItems session={session} />
        </div>
        
        <div className="flex items-center gap-3">
          <UserButton session={session} />
          <div className="md:hidden">
            <MobileNav session={session} />
          </div>
        </div>
      </div>
    </div>
  );
}
