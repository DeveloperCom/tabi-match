"use client";
import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

const rollImages: string[] = Array.from({ length: 14 }, (_, i) => `/roll/roll${i + 1}.jpg`);
const tabizenLogo = "/tabizen-logo.jpg";

async function toBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  // Guess mime type (png/jpg/svg)
  let mime = "image/png";
  if (url.endsWith(".jpg") || url.endsWith(".jpeg")) mime = "image/jpeg";
  if (url.endsWith(".svg")) mime = "image/svg+xml";
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  return `data:${mime};base64,${base64}`;
}

export default function PersonalityMatch() {

  const searchParams = useSearchParams(); // ReadonlyURLSearchParams
  const param = searchParams.get('customOutput'); // string | null
  const parsed = param !== null ? parseInt(param, 10) : NaN;

  const [userImage, setUserImage] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [matchImage, setMatchImage] = useState<string | null>(null);
  const [matchIdx, setMatchIdx] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Image upload from file
  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setUserImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onImageClick = () => {
    if (!hasRolled && inputRef.current) inputRef.current.click();
  };

  const glass =
    "bg-gradient-to-bl from-[#211217ee] via-[#111011b2] to-[#22040e] backdrop-blur-xl";



  // Roll animation and scoring
  // Roll animation and scoring - using rapid carousel approach
  const doRoll = () => {
    if (isRolling || hasRolled || !userImage) return;
    setIsRolling(true);

    let imageIndex = 0;
    let stepCount = 0;
    const totalSteps = 40; // Total number of image changes

    const rollStep = () => {
      setMatchIdx(imageIndex);
      imageIndex = (imageIndex + 1) % rollImages.length;
      stepCount++;

      console.log({ stepCount, imageIndex, currentDelay: getDelay(stepCount) });

      if (stepCount >= totalSteps) {
        // Final selection after the last slow step
        setTimeout(() => {

          const winner = (parsed >= 0 && parsed <= 13) ? parsed : Math.floor(Math.random() * rollImages.length);

          console.log( {winner, parsed, img:rollImages[winner]});
          setMatchIdx(winner);
          setMatchImage(rollImages[winner]);
          setScore(Math.floor(83 + Math.random() * 13));
          setIsRolling(false);
          setHasRolled(true);
        }, 300);
        return;
      }

      // Schedule next step with dynamic delay
      setTimeout(rollStep, getDelay(stepCount));
    };

    // Dynamic delay function - creates realistic slot machine timing
    const getDelay = (step: number) => {
      if (step <= 8) {
        // Start: Medium speed (400ms -> 200ms)
        return 400 - (step * 25);
      } else if (step <= 25) {
        // Middle: Very fast (80ms - 120ms)
        return 80 + Math.random() * 40;
      } else if (step <= 35) {
        // Slowing down: (120ms -> 400ms)
        const slowStep = step - 25;
        return 120 + (slowStep * 28);
      } else {
        // Final steps: Very slow (600ms -> 1000ms)
        const finalStep = step - 35;
        return 600 + (finalStep * 80);
      }
    };

    // Start the animation
    rollStep();
  };


  // Build a simple static HTML for screenshot
  const makeScreenshotHTML = (image: string) => `

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tabichain Personality Match</title>
  <style>
    body { background: #18181b; color: #fff; font-family: 'Inter',sans-serif; margin:0; }
    .card { border-radius: 30px; box-shadow:0 6px 42px #0008; margin: 48px auto; background: #14101a; width: 330px; padding: 2em 1em 1.5em 1em; text-align: center; }
    .row { display:flex; flex-direction: row; justify-content: center; align-items:center; gap: 18px; margin: 0.8em 0; }
    .imgbox { width: 90px; height:90px; border-radius:20px; border:4px solid #FF2572; background:#24182b; display:flex;align-items:center;justify-content:center;overflow:hidden }
    .imgbox2 { border-color: #2572FF;}
    .vs { font-weight:bold; font-size:1.3em; color:#FF2572;}
    .score { color:#2572FF; font-size:2.2em; font-family:sans-serif; font-weight:bold;margin:0.3em 0}
    .txt {color:#F3D3E0;}
  </style>
</head>
<body>
<div class="card">
  <h2 style="margin:-0.2em 0 0.1em 0;font-size:1.35em;color:#FF2572">Tabichain Personality Match</h2>
  <div class="row">
    <div class="imgbox">
      ${userImage
      ? `<img src="${userImage}" alt="User" style="object-fit:cover;width:100%;height:100%;"/>`
      : `<span style='color:#ff2572;opacity:.7'>No Image</span>`
    }
    </div>
    <div class="vs">VS</div>
    <div class="imgbox imgbox2">
      <img src="${image}" alt="Tabizen" style="object-fit:cover;width:100%;height:100%;"/>
    </div>
  </div>
  <div class="score">${score ?? ""}%</div>
  <div class="txt">Your personality match!</div>
</div>
</body>
</html>
`;

  // Share/download logic calling your /api/screenshot endpoint
  const onShare = async () => {
    setPreview(null); // clear last preview
    const image = matchImage ?? tabizenLogo
    const html = makeScreenshotHTML(await toBase64(image));
    console.log(html)
    const res = await fetch("/api/screenshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html }),
    });
    if (!res.ok) return alert("Could not render screenshot.");
    const blob = await res.blob();
    const file = new File([blob], "personality-match.png", { type: "image/png" });

    // Try native share
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Tabichain Personality Match",
        text: "Check out my result!",
      });
    } else {
      // Preview below card and auto-download
      setPreview(URL.createObjectURL(blob));
      // Auto-download (optional)
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "personality-match.png";
      a.click();
    }
  };


  return (
    <main className="flex flex-col min-h-screen w-screen items-center justify-center relative overflow-x-hidden px-4 mt-7 ">

      {/* Glowing BG accents with no close div*/}
      <div className="absolute left-0 top-0 w-80 h-[35vh] rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-[30vw] h-[26vh] rounded-full blur-2xl opacity-25 bg-[#ffabc3]" />


      {/* Main layout */}
      <div className="flex flex-col gap-6 w-full max-w-[900px] z-10 items-center justify-center">
        {/* Top: VS cards - Mobile friendly with responsive sizing */}



        <div className="flex flex-row gap-3 sm:gap-6 md:gap-8 mb-1 items-end justify-center w-full">
          {/* Card Wrapper */}
          <motion.div
            className={`card-custom flex flex-col items-center bg-[#15121e90] px-2 py-2 sm:px-3 sm:py-3 rounded-2xl sm:rounded-3xl shadow-card transition-all duration-300 ${glass}`}
            whileHover={{
              y: -16,
              scale: 1.06,
              rotateY: 8,
              rotateX: 4,
              boxShadow: "0 0 84px 26px #ff417acc, 0 8px 24px 9px #000000b0"
            }}
            style={{ perspective: 1000 }}
          >
            <div className="flex-1 flex justify-center items-center w-full">
              <div
                className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/5] cursor-pointer border-2 border-[#ff417a]/50 bg-[#15121e90] hover:bg-[#251531] transition-all flex items-center justify-center"
                onClick={onImageClick}
              >
                {userImage ? (
                  <img
                    src={userImage}
                    alt="User"
                    className="object-cover w-full h-full rounded-2xl sm:rounded-3xl"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#ff417a] font-bold select-none text-xs sm:text-sm bg-[#191218]/80 text-center">
                    Upload Image
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={inputRef}
                  onChange={onUpload}
                  disabled={hasRolled}
                  className="hidden"
                />
              </div>
            </div>
            <div className="text-white text-center text-xs sm:text-sm md:text-lg font-bold tracking-wider mt-2">
              Your Profile
            </div>
          </motion.div>

          {/* VS */}
          <div className="flex flex-col items-center justify-center mx-1">
            <div className="text-2xl sm:text-3xl md:text-4xl uppercase font-black text-[#ff3d7a] drop-shadow-2xl mb-2">
              VS
            </div>
          </div>

          {/* Right Card */}
          <motion.div
            className={`card-custom flex flex-col items-center bg-[#15121e90] px-2 py-2 sm:px-3 sm:py-3 rounded-2xl sm:rounded-3xl shadow-card transition-all duration-300 ${glass}`}
            whileHover={{
              y: -16,
              scale: 1.06,
              rotateY: 8,
              rotateX: 4,
              boxShadow: "0 0 84px 26px #ff417acc, 0 8px 24px 9px #000000b0"
            }}
            style={{ perspective: 1000 }}
          >
            <div className="flex-1 flex justify-center items-center w-full">
              <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/5] border-2 border-[#ff417a]/50 bg-[#15121e90] flex items-center justify-center">
                {/* your logic */}
                {!isRolling && !hasRolled && (
                  <img
                    src={tabizenLogo}
                    alt="Tabichain"
                    className="object-contain w-full h-full rounded-2xl sm:rounded-3xl"
                  />
                )}
                {(isRolling || hasRolled) && (
                  <img
                    key={`carousel-${matchIdx}`}
                    src={rollImages[matchIdx]}
                    alt="Match"
                    className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
                  />
                )}
              </div>
            </div>
            <div className="text-white text-center text-xs sm:text-sm md:text-lg font-bold tracking-wider mt-2">
              Tabi Match
            </div>
          </motion.div>
        </div>






        {/* Centered Match Button and Score */}
        <div className="flex flex-col items-center -mt-4 sm:-mt-6 md:-mt-8">
          <motion.div
            animate={hasRolled ?
              {
                scale: [1, 1.13, 1], filter: [
                  "drop-shadow(0 0 18px #fb183b)",
                  "drop-shadow(0 0 46px #ff417a80)",
                  "drop-shadow(0 0 14px #fb3263)"
                ]
              }
              : { scale: 1 }
            }
            transition={{ repeat: hasRolled ? Infinity : 0, repeatType: "mirror", duration: 2 }}
            className="text-4xl sm:text-6xl md:text-[95px] font-extrabold text-[#ff3f6c] leading-none drop-shadow-2xl"
            style={{ letterSpacing: "0.05em" }}
          >{score ? `${score}%` : "--"}</motion.div>

          <motion.button
            className={`mt-3 sm:mt-4 md:mt-5 px-6 sm:px-8 md:px-12 py-3 sm:py-4 rounded-full font-extrabold 
              text-sm sm:text-base md:text-lg tracking-widest text-white bg-gradient-to-r from-[#ff2572] 
              via-[#ff5d98] to-[#ff58a8] shadow-[0_0_50px_10px_#ff69b2aa] border-2 border-[#ff2b63cc] 
              transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            whileHover={{ scale: 1.06, boxShadow: "0 0 80px 12px #ff5ca7" }}
            animate={hasRolled ? {
              boxShadow: [
                "0 0 30px 15px #ff69b288",
                "0 0 20px 10px #fdabc366",
                "0 0 30px 15px #ff69b288"
              ]
            } : { boxShadow: "0 0 20px 5px #ff69b288" }}
            transition={{
              repeat: hasRolled ? Infinity : 0,
              repeatType: "loop",
              duration: 2,
              ease: "easeInOut"
            }}
            onClick={doRoll}
            disabled={isRolling || hasRolled || !userImage}
          >
            {hasRolled ? "Match Complete!" : "Personality Match"}
          </motion.button>

          {/* Share Button - Show after match is complete */}
          {/* <AnimatePresence>
            {hasRolled && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 px-6 py-2 rounded-full font-bold text-sm tracking-wide text-[#ff2572] 
                  bg-transparent border-2 border-[#ff2572] hover:bg-[#ff2572] hover:text-white 
                  transition-all duration-300"
                onClick={onShare}
              >
                Share Result
              </motion.button>
            )}
          </AnimatePresence> */}
        </div>
      </div>

    </main>
  );

}