"use client";
import React from "react";
import { Button } from "./ui/button";
import { signIn } from "next-auth/react";

type ActionButtonProps = {
  buttonText: string;
};

const ActionButton: React.FC<ActionButtonProps> = ({ buttonText }) => {
  return (
    <div 
      className="fixed bottom-4 left-4 right-4 md:right-auto md:w-auto md:left-auto md:bottom-auto md:top-4 z-30"
      style={{ animation: 'animatedgradient 2s ease infinite alternate' }}
    >
      <Button
        className="hover:scale-105 transition duration-300 ease-in-out w-full md:w-auto rounded-full text-xl bg-green-600 text-white"
        onClick={() => signIn()}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default ActionButton;
