"use client"
import React from "react";
import TypewriterTitle from "./TypewriterTitle";
import ActionButton from "./ActionButton";
import Link from "next/link";
import { Button } from "./ui/button";
import InfoVideo from "./InfoVideo";
import RestoredImagemid from "./RestoredImagemid";



function InfoSection(props : any) {
  const { session } = props;

  return (
<div className="flex-col text-white items-center pt-0">
<p className="text-lg font-bold italic mt-10 mx-6 lg:mt-8"> Edit your Photo with Caption in Seconds! </p>
  <div className="flex flex-col lg:flex-row gap-8 p-4 max-w-6xl w-full">
  <div className=" w-full mt-2 mb-10 lg:mt-0">
    <RestoredImagemid />
    <div className="flex justify-center mt-8 px-4">
    {!session && 
        <ActionButton buttonText="Sign Up - For Free" />}
        {session && (
          <Link href="/dream">
            <Button
              className="w-full lg:w-1/2 rounded-full text-xl"
              style={{ backgroundColor: 'green', color: 'white' }}
            >
              Enhance your Photo!
            </Button>
          </Link>
        )}</div>
  </div>
  


    <div className="flex flex-col space-y-4 px-5 mt-4 lg:w-1/2 w-full">
    <h1 className="yeseva text-2xl font-bold">
      Unleash Your Creativity with Every Click!
    </h1>
    <div className="italic text-lg text-justify font-bold mt-5 py-4" >
      Do you feel limited by traditional photo editing tools and presets?
      <br/>
      <br/>
      Isn't it frustrating when you can't bring the vision of your perfect photo to life?
      <br/>
      <br/>
      Imagine a platform where every edit is a new discovery, transforming your photos with just a description. <span className="text-green-400">Ready to unleash your creativity?</span>
    </div>
    <div className="text-xl font-bold text-green-400">
      <TypewriterTitle />
    </div>
      
      <div className="flex justify-center flex-col space-y-2">
       
       
      </div>
    </div>

  </div>
</div>

  );
}

export default InfoSection;
