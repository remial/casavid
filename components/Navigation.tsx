"use client";

import {
  ChevronsLeft,
  MenuIcon,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Trash
} from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ElementRef, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
//import { useMutation } from "convex/react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
//import { api } from "@/convex/_generated/api";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { useNewDoc } from "@/hooks/use-new";

import { Item } from "./item";
import { DocumentList } from "./document-list";
import { TrashBox } from "./trash-box";

import UserItem from "./UserItem";
import { Navbar } from "./navbarnew";
import UpgradeButtonSmall from "./UpgradeButtonSmall";
//import { Topbar } from "./Topbar";

export const Navigation = () => {
  const router = useRouter();
  const settings = useSettings();
  const search = useSearch();
  const [isSubscriber, setIsSubscriber] = useState(false);
  const newdoc = useNewDoc()
  const params = useParams();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isLoading, setIsLoading] = useState(true);
  //const create = useMutation(api.documents.create);

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/userSubscription', {
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const buffer = await response.arrayBuffer();
        const string = Buffer.from(buffer).toString();
        const convertedBoolean: boolean = string.toLowerCase() === 'true';
        setIsSubscriber(convertedBoolean);
        // Log the directly obtained values and the intended state
        //console.log("String1?", string);
        //console.log("ConvertedBoolean1?", convertedBoolean);
        //console.log("Intended isSubscriber1?", convertedBoolean); // Log the intended value
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchSubscriptionStatus();
  }, []); 

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile]);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;

    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px)`);
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 240px)"
      );
      navbarRef.current.style.setProperty(
        "left",
        isMobile ? "100%" : "240px"
      );
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
      setTimeout(() => setIsResetting(false), 300);
    }
  }

  const handleCreate = async () => {
    try {
      //console.log("hc client")
      // Make sure to adjust the endpoint URL as needed, especially if you're using a specific API route or parameter.
      const response = await fetch('/api/createdocument', {
        method: 'POST',
        headers: {
          // Specify any necessary headers
          'Content-Type': 'application/json',
        },
        //credentials: 'include', // This is important for sending cookies in cross-origin requests
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const data = await response.json();
      toast.success('Document created successfully!');
      
      // Redirect to the new document page or perform any other actions needed
      // For example, using Next.js router to push a new page
      // router.push(`/document/${data.doc_id}`);
    } catch (error) {
      console.error("Failed to create the document: ", error);
      toast.error('Failed to create the document.');
    }
  };
  

  return (
    <div suppressHydrationWarning>
    
      <aside 
      
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-full pt-4 bg-secondary overflow-y-auto relative flex w-60 flex-col z-[20]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "opacity-100"
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>
        <div className="mb-4">
        
          {/*<Item
            label="Search"
            icon={Search}
            isSearch
            onClick={search.onOpen}
          />*/}


          
          
        </div>
           
        {/*<Item
            label="Settings"
            icon={Settings}
            onClick={settings.onOpen}
        />*/}
         <div className="mt-4 text-white bg-green-600 rounded w-40"> 
        <Item
            label="New Document"
            icon={PlusCircle}
            onClick={newdoc.onOpen}
            
          />
          </div>
        <div className="mt-4">
          <div className="pl-2">
          <DocumentList />
          </div>
          {/*<Item
            onClick={handleCreate}
            icon={Plus}
            label="Add a Document"
          />*/}
           {/*<Popover>
            <PopoverTrigger className="w-full mt-4">
              <Item label="Trash" icon={Trash} />
            </PopoverTrigger>
            <PopoverContent
              className="p-0 w-72"
              side={isMobile ? "bottom" : "right"}
            >
              
            </PopoverContent>
           <TrashBox />
          </Popover>*/}
        </div>
        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </aside>
      <div
        ref={navbarRef}
        className={cn(
          "absolute top-12 z-[9999] left-60 w-[calc(100%-240px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full"
        )}
            
        
      >
        <nav className="bg-transparent px-3 py-2 sticky top-0">
          
      {isCollapsed && <MenuIcon onClick={resetWidth} role="button" className="bg-white h-10 w-10 text-muted-foreground" />}
    </nav>

        {/*!!params.documentId ? (
          <Topbar
            isCollapsed={isCollapsed}
            onResetWidth={resetWidth}
          />
        ) : (
          <nav className="bg-transparent px-3 py-2 w-full">
            {isCollapsed && <MenuIcon onClick={resetWidth} role="button" className="h-6 w-6 text-muted-foreground" />}
          </nav>
        )}*/}
      </div>
    </div>
  )
}