import {cn} from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from 'next/image';


function UserAvatar({
    name,
    image,
    className
}:{
    name?: string | null;
    image?: string | null;
    className?: string;
}) {
  return (
        <Avatar className={cn("bg-white text-black h-10 w-10", className)}>
             {image && (
                <Image 
                src={image || ""}
                alt={name || "User name"}
                width={40}
                height={40}
                className="rounded-full mx-auto"
                />

            )}
  {/*<AvatarImage src="https://github.com/shadcn.png" />*/}
  {<AvatarFallback 
  delayMs={1000}
  className="w-10 h-10 rounded-full font-bold border border-black">
    {name
      ?.split(" ")
      .map((n) => n[0])
      .join("")}  
  </AvatarFallback>}
</Avatar>

  )
}

export default UserAvatar