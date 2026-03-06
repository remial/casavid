"use client";

import { useEffect, useState } from "react";

import { SettingsModal } from "@/components/modals/settings-modal";
//import { CoverImageModal } from "@/components/modals/cover-image-modal";
import { NewdocModal } from "@/components/modals/newdoc-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  
  return (
    <>
      <SettingsModal />
      <NewdocModal />
      
    </>
  );
};
