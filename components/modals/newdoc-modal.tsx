"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader
} from "@/components/ui/dialog";
import React, { useState } from 'react';
import { useNewDoc } from "@/hooks/use-new";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";
import { Switch } from "@/components/Switch";
import { Button } from "../ui/button";
import { Loader2, Plus } from "lucide-react";
import { Input } from "../ui/input";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Textarea } from "../ui/textarea";

export const NewdocModal = () => {
  const router = useRouter();
  const newdoc = useNewDoc();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [prompt, setPrompt] = React.useState("");
  const [validationMessage, setValidationMessage] = useState("");
 
 

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const wordCount = prompt.trim().split(/\s+/).length;
    if (wordCount <= 4) {
      setValidationMessage("*Add a more detailed description to proceed"); // Update validation message
      setIsSubmitting(false); // Stop submission process
      return; // Exit the function early
    }
    
    setValidationMessage("");
     
    try {
      //console.log("hc client")
      // Make sure to adjust the endpoint URL as needed, especially if you're using a specific API route or parameter.
      console.log("Title is ", input)
      console.log("Description is ", prompt)
      const response = await fetch('/api/createdocument', {
        method: 'POST',
        headers: {
          // Specify any necessary headers
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: input }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const data = await response.json();

      console.log("Document ID is ", data.doc_id)

      const apiresponse = await fetch('/api/firstgenerate', {
        method: 'POST',
        headers: {
          // Specify any necessary headers
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: prompt,
          doc_id: data.doc_id, 
          title: input,
        }),
      });
  
      if (apiresponse.ok) {
        toast.success('Document created successfully!');
        newdoc.onClose();
        router.push(`/documents/${data.doc_id}`);
      } else {
        // Handle non-200 responses
        if (apiresponse.status === 429) {  // 429 is the status code for Too Many Requests, as used in the API
          window.alert('👉You have exceeded your daily limit of 400 AI generated words. \n\nPlease check back in 24 HOURS or 🌟Subscribe🌟 for Unlimited words');
          newdoc.onClose();
          router.push('/pricingpage');
        } else {
          toast.error('An error occurred while creating the document.');
        }
      }
    } catch (error) {
      console.error("Failed to create the document: ", error);
      toast.error('Failed to create the document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={newdoc.isOpen} onOpenChange={newdoc.onClose}>
      <DialogContent className="bg-white z-50 opacity-100">
        <DialogHeader className="border-b pb-3">
          <h2 className="text-xl font-medium text-gray-900">
            😀 Hey! what do you want to write about today? 
          </h2>
        </DialogHeader>
        <div className="flex items-center justify-between">
          <div className="text-xl flex flex-col gap-y-1">
            <Label className="text-xl">
              Description
            </Label>
            {/*<span className="text-[0.8rem] text-muted-foreground">
            You can create a new Document by typing a Title and clicking on Create below.
            </span>*/}
            
          </div>
          <p className="pt-2"></p>
          
          
        </div>
        <form onSubmit={handleSubmit}>
        <Textarea className="border-gray-900 text-bold"
          value={prompt}
          onChange={(e) => {
            const newPrompt = e.target.value;
            const np = newPrompt.trim().split(/\s+/);
            if (np.length <= 50) {
              setPrompt(newPrompt);
            } else if (prompt.trim().split(/\s+/).length < 20) {
              // This condition allows typing within the limit but stops additional input once the limit is reached.
              // It prevents adding new words but allows editing within the existing text up to the word limit.
              setPrompt(np.slice(0, 50).join(' '));
            }
            // If the user is editing within the limit, it won't update the input if they try to add more words,
            // but will allow editing the existing text.
          }}
          placeholder="e.g. A Research Paper on the Impact of Blockchain Technology in the Digital Age looking at Pros and Cons"
        />
        {validationMessage && (
            <div className="text-red-500">{validationMessage}</div>
          )}
        <p className="py-4"></p>
        <Label className="text-xl">
              Title (optional)
          </Label>

          <Input className="border-gray-900 text-bold"
          value={input}
          onChange={(e) => {
            const newText = e.target.value;
            const words = newText.trim().split(/\s+/);
            if (words.length <= 50) {
              setInput(newText);
            } else if (input.trim().split(/\s+/).length < 20) {
              // This condition allows typing within the limit but stops additional input once the limit is reached.
              // It prevents adding new words but allows editing within the existing text up to the word limit.
              setInput(words.slice(0, 50).join(' '));
            }
            // If the user is editing within the limit, it won't update the input if they try to add more words,
            // but will allow editing the existing text.
          }}
          placeholder="e.g. Blockchain Technology in the Digital Age"
        />
        <div className="h-4"></div>
        <div className="flex items-center gap-2 justify-center">
        {!isSubmitting && ( <Button 
          type="button"
          className="border-gray-900" variant={"outline"} onClick={newdoc.onClose}>
            Cancel
          </Button>)}
          
          {!isSubmitting && (<Button
            type="submit"
            className="border-green-900 text-green-800 bg-green-600"
            disabled={isSubmitting} // Disable the button while submitting
          >
            
            <div className="py-1.5 px-5 text-lg text-white bg-green-600 rounded-md">
              Create
            </div>
          </Button>)}
           {isSubmitting && (
          <div className="flex justify-center items-center flex-col w-full">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>Creating your document...</p>
          </div>
             )}


        </div>
       
      </form>
      </DialogContent>
    </Dialog>
  );
};
