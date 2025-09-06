"use client";
import React, { Suspense } from "react";

import Navbar from "../components/ui/Navbar";
import PersonalityMatch from "../components/ui/PersonalityMatch";
import { SparklesCore } from "../components/ui/sparkles";
import Loader from "../components/ui/Loading";

export default function Home() {

  return (
    <div className="min-h-screen relative w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
      <div className="w-full absolute inset-0 h-screen">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>
      <Navbar />
      <Suspense fallback={<Loader variant={'spinner'} size={'large'}/>}>
        <PersonalityMatch />
      </Suspense>
    </div>
  );
}
