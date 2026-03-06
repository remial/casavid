"use client";
{/*
//import { useQuery } from "convex/react";
import { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import { MenuIcon } from "lucide-react";

//import { api } from "@/convex/_generated/api";
//import { Id } from "@/convex/_generated/dataModel";

import { Title } from "./title";
//import { Banner } from "./banner";
//import { Menu } from "./menu";
//import { Publish } from "./publish";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
};

interface Document {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
  docState: object;
  isArchived: boolean;
  isPublished: boolean;
}

export const Topbar = ({
  isCollapsed,
  onResetWidth
}: NavbarProps) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        // Replace `/api/fetchdocuments` with the correct path to your API endpoint
        const response = await fetch(`/api/fetchdocuments?documentId=${params.documentId}`);
        if (!response.ok) {
          throw new Error('Document fetching failed');
        }
        const data = await response.json();
        setDocument(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [params.documentId]);
  

  if (isLoading) {
    return (
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center justify-between">
        <Title.Skeleton />
      </nav>
    );
  }

  if (error || document === null) {
    return null; // Or handle error state more gracefully
  }

  return (
    <>
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center gap-x-4">
        {isCollapsed && (
          <MenuIcon
            role="button"
            onClick={onResetWidth}
            className="h-6 w-6 text-muted-foreground"
          />
        )}
        <div className="flex items-center justify-between w-full">
          <Title initialData={document} />
          
        </div>
      </nav>
     
    </>
  )
}
*/}