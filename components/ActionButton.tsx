"use client"
import React from 'react';
import { Button } from './ui/button';
import { signIn } from 'next-auth/react';


type ActionButtonProps = {
    buttonText: string; 
};

const ActionButton: React.FC<ActionButtonProps> = ({ buttonText }) => {
    return (
        <div className="flex justify-center" style={{animation: 'animatedgradient 2s ease infinite alternate'}}>
            <Button 
                className="hover:scale-105 transition duration-300 ease-in-out w-full lg:w-auto lg:px-8 rounded-full text-xl bg-green-600 text-white" 
                onClick={() => signIn()}
            >
                {buttonText} 
            </Button>
        </div>
    );
};

export default ActionButton;
