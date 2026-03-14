"use client";

import { ChevronsLeftRight } from "lucide-react";
//import { useUser, SignOutButton } from "@clerk/clerk-react";

import {
  Avatar,
  AvatarImage
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { signOut } from "next-auth/react";

export default async function UserItem() {
  const session = await getServerSession(authOptions);

  

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div role="button" className="flex items-center text-sm p-3 w-full hover:bg-primary/5">
          <div className="gap-x-2 flex items-center max-w-[150px]">
            <Avatar className="h-5 w-5">
              {session?.user.image}
            </Avatar>
            <span className="text-start font-medium line-clamp-1">
              {session?.user.name}&apos;s Jotion
            </span>
          </div>
          <ChevronsLeftRight className="rotate-90 ml-2 text-muted-foreground h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80"
        align="start"
        alignOffset={11}
        forceMount
        translate="no"
        suppressHydrationWarning
      >
        <div className="flex flex-col space-y-4 p-2">
          <p className="text-xs font-medium leading-none text-muted-foreground">
            {session?.user.email}
          </p>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-secondary p-1"> 
              <Avatar className="h-8 w-8">
              {session?.user.image}
              </Avatar>
            </div>
            <div className="space-y-1">
              <p className="text-sm line-clamp-1">
              {session?.user.name}&apos;s Jotion
              </p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="font-bold cursor-pointer text-blue-500" onClick={() => signOut ({ callbackUrl: '/' })}> Log Out </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}