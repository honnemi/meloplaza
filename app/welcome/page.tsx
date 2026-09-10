"use client";

import Window from "@/components/Window";
import Button from "@/components/Button";
import { useState } from "react";
import { useFormStore } from "@/app/context/FormContext";

export default function Welcome() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 sm:p-12">
      <Window
        title="Welcome to meloplaza!"
        footer={
          <div className="flex justify-between w-full">
            <Button label="Back" href="/create-avatar" />
            <Button label="Next" href="/select-song" />
          </div>
        }
      >
        <h1 className="text-lg font-bold mb-2 text-center text-gray-800">
          What is it?
        </h1>
        <p className="text-center mt-4">meloplaza is a place to discover music the old-fashioned way — through other people!</p>
        <p className="text-center">don't let algorithms dictate the way you listen; seek out new music yourself.</p>
        <p className="text-center">share music you love and resonate with and see why other people love the music they do too!</p>
        <h2 className="text-lg font-bold mb-2 mt-4 text-center text-gray-800">RULES:</h2>
        <ul className="list-disc list-inside pl-5">
          <li className="text-left">Be sensible. No overly inappropriate usernames or messages.</li>
          <li className="text-left">Be respectful. No offensive/discriminatory usernames or messages.</li>
          <li className="text-left">Otherwise, just have fun!</li>
        </ul>

       
      </Window>
    </div>
  );
}