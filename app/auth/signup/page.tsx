"use client"
import React, { ChangeEvent, FormEvent, useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, UserCredential } from "firebase/auth";
import { auth } from "../../firebase";
import { FirebaseError } from "firebase/app";
import { z } from "zod";
import Image from "next/image";
import home from "@/public/homespg.png"; 

// Define a schema for user credentials
const userSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(4, { message: "Password must be at least 4 characters long" }),
  passwordConfirmation: z.string()
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords don't match",
  path: ["passwordConfirmation"],
});

const disposableDomains = ["mailinator.com", "10minutemail.com", "yopmail.com", "maildepot.net", "guerrillamail.com", "tempmail.com",
  "throwawaymail.com", "getnada.com", "fakeMailGenerator.com", "trashMail.com", "myTemp.email"
];

const containsPlusSymbol = (email: string) => {
  return email.includes("+");
};


const isDisposableEmail = (email: string) => {
  const domain = email.split("@")[1];
  return disposableDomains.includes(domain);
};

const containsRestrictedWord = (email: string) => {
  return email.toLowerCase().includes("silfa");
};

const SignUp = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const signUp = (e: FormEvent) => {
    e.preventDefault();

    if (isDisposableEmail(email)) {
      setErrorMessage("Disposable emails are not allowed. Please use a valid email.");
      return;
    }

    if (containsPlusSymbol(email)) {
      setErrorMessage("Not allowed. Please use a valid email.");
      return;
    }

    if (containsRestrictedWord(email)) {
      setErrorMessage("You have used 5 different emails already. Please contact us if you are an Affiliate, or your unique userID, Location and all future emails will be banned.");
      return;
    }

    
    

    setIsSubmitting(true);

    // Validate user data
    const validationResult = userSchema.safeParse({ email, password, passwordConfirmation });
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => issue.message).join(', ');
      setErrorMessage(errors);
      setSuccessMessage("");
      setIsSubmitting(false);
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential: UserCredential) => {
        // Track signup goal with DataFast
        if (typeof window !== 'undefined' && window.datafast) {
          window.datafast('signup', {
            email: email,
          });
        }
        
        // Handle successful registration
        sendEmailVerification(userCredential.user)
          .then(() => {
          setSuccessMessage("Email verification sent! Please check your inbox (or email spam folder) to continue.");
          setErrorMessage("");
        })
          .catch((error: Error) => console.log(error));
      })
      .catch((error: FirebaseError) => {
        if (error instanceof FirebaseError) {
          setErrorMessage(error.code.split('/')[1]);
        } else {
          setErrorMessage("An unexpected error occurred");
        }
      })
      .finally(() => {
        setIsSubmitting(false);
        setTimeout(() => setIsSubmitting(true), 10000); // Re-enable the button after 30 seconds
      });
  };


  return (
    <div>
       <div className="logo flex justify-center mt-10 mb-2 rounded-full">
        <Image src={home} className="" alt="Website Logo" width={40} height={40} />
      </div>
    <div className="sign-in-container flex items-center justify-center bg-purple-100 pt-5">

      
      
    <form className="bg-white shadow-md rounded-xl px-16 pt-12 pb-12 mb-4 max-w-md w-full" onSubmit={signUp}>
      <h1 className="block text-gray-700 text-lg font-bold mb-4">Create Account</h1>
      {errorMessage && (
          <p className="text-red-500 text-sm pb-2">{errorMessage}</p> 
        )}
        {successMessage && (
          <p className="text-green-500 text-sm pb-2">{successMessage}</p>
        )}
      <div className="mb-8">
        <input
          className="shadow appearance-none border rounded-xl w-full py-4 px-6 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-lg"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        ></input>
      </div>
      <div className="mb-8">
        <input
          className="shadow appearance-none border rounded-xl w-full py-4 px-6 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline text-lg"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        ></input>
      </div>
      <div className="mb-12">
          <input
            className="shadow appearance-none border rounded-xl w-full py-4 px-6 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline text-lg"
            type="password"
            placeholder="Confirm your password"
            value={passwordConfirmation}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordConfirmation(e.target.value)}
          ></input>
        </div>
        <div>
          {successMessage && (
          <p className="text-green-500 text-sm pb-2">{successMessage}</p>
        )}
        
        </div>
      <div className="flex items-center justify-center">
       <button
      disabled={isSubmitting}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded focus:outline-none focus:shadow-outline text-lg"
      type="submit"
    >
      Sign Up
    </button>
      </div>
    </form>
  </div>
  
  </div>
  );
};

export default SignUp;
