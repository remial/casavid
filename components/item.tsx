"use client";

import { 
  ChevronDown, 
  ChevronRight, 
  LucideIcon,
  MoreHorizontal,
  Plus,
  Trash
} from "lucide-react";
//import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
//import { useUser } from "@clerk/clerk-react";

//import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
//import { api } from "@/convex/_generated/api";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
//import { router } from "@/src/trpc/trpc";

interface ItemProps {
  id?: any;
  documentIcon?: string;
  active?: boolean;
  expanded?: boolean;
  isSearch?: boolean;
  level?: number;
  onExpand?: () => void;
  label: string;
  onClick?: () => void;
  icon: React.ElementType;
};

export const Item = ({
  id,
  label,
  onClick,
  icon: Icon,
  active,
  documentIcon,
  isSearch,
  level = 0,
  onExpand,
  expanded,
}: ItemProps) => {
  
  

  const onArchive = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
  };
  const router = useRouter();
  const onDelete = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation(); // Prevent triggering other click events
    if (!id) {
      console.error('Document ID is undefined');
      return;
    }
  
    try {
      // Call your API endpoint with the document ID
      const response = await fetch('/api/deleteDocument', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId: id }), // Assuming `id` is your document ID
      });
  
      if (response.ok) {
        // Optionally: Refresh your data or redirect
        toast.success('Document deleted successfully');
        //router.push(`/editor`);
        window.location.reload();
        
      } else {
        // Handle non-OK responses
        console.error('Failed to delete document');
        const errorText = await response.text();
        toast.error(`Error: ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('An error occurred while deleting the document.');
    }
  };
  

  const handleExpand = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    onExpand?.();
  };

  const onCreate = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
   
  };

  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <div
      onClick={onClick}
      role="button"
      style={{ 
        paddingLeft: "6px"
      }}
      className={cn(
        "group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium",
        active && "bg-primary/5 text-primary"
      )}
    >
      {!!id && (
        <div
          role="button"
          className="h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-1"
          onClick={handleExpand}
        >
          
        </div>
      )}
      {documentIcon ? (
        <div className="shrink-0 mr-2 text-[18px]">
          {documentIcon}
        </div>
      ) : (
        <Icon 
          className="shrink-0 h-[18px] w-[18px] mr-2 text-muted-foreground"
        />
      )}
      <span className={cn("truncate", active ? "bg-gray-500 text-white" : "")}>
        {label}
      </span>

      {/*isSearch && (
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      )*/}
      {!!id && (
        <div className="ml-auto flex items-center gap-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              asChild
            >
              <div
                role="button"
                className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-60 bg-white"
              align="start"
              side="right"
              forceMount
            >
              <DropdownMenuItem className=" text-red-500 bg-white pt-4 cursor-pointer" onClick={onDelete}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
            </DropdownMenuContent>
          </DropdownMenu>
          <div
            role="button"
            
            className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
          >
            {/*<Plus className="h-4 w-4 text-muted-foreground" />*/}
          </div>
        </div>
      )}
    </div>
  )
}

Item.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
  return (
    <div
      style={{
        paddingLeft: level ? `${(level * 12) + 25}px` : "12px"
      }}
      className="flex gap-x-2 py-[3px]"
    >
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-[30%]" />
    </div>
  )
}