import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
//import { useQuery } from "convex/react";
import { FileIcon } from "lucide-react";
//import { Doc, Id } from "@/convex/_generated/dataModel";
//import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

import { Item } from "./item";
import { Input } from "./Input";

interface Document {
  id: string;
  title: string;
  createdAt: Timestamp; 
  userId: string;
  docState: object;
  isArchived: boolean;
  isPublished: boolean;
}

interface DocumentListProps {
  //parentDocumentId?: Id<"documents">;
  level?: number;
}

interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export const DocumentList = ({
  //parentDocumentId,
  level = 0,
}: DocumentListProps) => {
  const params = useParams();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [documents, setDocuments] = useState<Document[]>([]);
  const [editableDocId, setEditableDocId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onExpand = (documentId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [documentId]: !prevExpanded[documentId],
    }));
  };

  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/fetchdocument', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        let docs = await response.json();
  
        docs.sort((a: Document, b: Document) => {
          
          const dateA = new Date(a.createdAt.seconds * 1000 + a.createdAt.nanoseconds / 1000000);
          const dateB = new Date(b.createdAt.seconds * 1000 + b.createdAt.nanoseconds / 1000000);
                
          return dateB.getTime() - dateA.getTime();
        });     
        
        setDocuments(docs);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };
  
    fetchDocuments();
  }, []); // Empty dependency array means this effect runs once on mount

  const updateDocumentTitle = async (id : any, title : any) => {
    // Assuming you have a similar state for loading
    try {
      // Convert your data to a JSON string
      const dataString = JSON.stringify({ id, editedTitle: title });
      // Convert the string to a buffer
      const buffer = new TextEncoder().encode(dataString);
  
      // Send the buffer to your API
      const response = await fetch('/api/updatetitle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Convert the buffer to an ArrayBuffer for the fetch body
        body: buffer,
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Assuming the response is also a buffer that you convert back to text
      const responseBuffer = await response.arrayBuffer();
      const responseString = new TextDecoder().decode(responseBuffer);
      const result = JSON.parse(responseString);
      console.log("Update successful:", result);
  
    } catch (error) {
      console.error("Failed to update document title:", error);
    } 
  };
  

  const onEditEnable = (doc: Document) => {
    setEditableDocId(doc.id);
    setEditedTitle(doc.title);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const onSaveEdit = (id: string) => {
    console.log("Title changed for document: ", id)
    console.log("New Title is: ", editedTitle)
    setEditableDocId(null);
    updateDocumentTitle(id, editedTitle);
    // Update the local state to reflect the changes immediately without refetching
    setDocuments(docs => docs.map(doc => doc.id === id ? { ...doc, title: editedTitle } : doc));
  };
  
  return (
    <>
    {documents.map((document) => (
      <div key={document.id} className="mt-4">
        {editableDocId === document.id ? (
          <Input
          ref={inputRef}
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={() => {
            console.log("Document ID about to be edited: ", document.id);
            onSaveEdit(document.id);
          }}
          onKeyDown={(e : any) => {
            if (e.key === 'Enter') {
              e.preventDefault(); // Prevent the default action to avoid any unwanted behavior
              onSaveEdit(document.id);
              e.currentTarget.blur(); // Optionally, blur the input to trigger onBlur and close the editor
            }
          }}
          className="editable-input-class"
        />
        ) : (
          <div 
            onDoubleClick={() => onEditEnable(document)}
            onClick={() => router.push(`/documents/${document.id}`)}
            className="cursor-pointer"
          >
            <Item
              id={document.id}
              label={document.title}
              icon={FileIcon} // Assuming this is how you're passing an icon
              active={params.documentId === document.id}
            />
          </div>
        )}
      </div>
    ))}
  </>
  );
};
