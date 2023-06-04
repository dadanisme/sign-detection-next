import React, { useEffect, useState } from "react";
import { BiMicrophone } from "react-icons/bi";
import { BsChevronLeft, BsSquareFill } from "react-icons/bs";
import Link from "next/link";
import Head from "next/head";
import clsx from "clsx";

const ANDROID = "Linux armv8l";

export default function Speech() {
  const [recognizer, setRecognizer] = useState<SpeechRecognition>();
  const [result, setResult] = useState<string>();
  const [os, setOs] = useState<string>();
  const [isListening, setIsListening] = useState(false);

  const start = () => {
    setResult(undefined);
    os === ANDROID && setIsListening(true);
    recognizer?.start();
  };

  const stop = () => {
    os === ANDROID && setIsListening(false);
    recognizer?.stop();
  };

  const handleResult = (event: SpeechRecognitionEvent) => {
    setResult(event.results[0][0].transcript);
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "id-ID";

      recognition.onresult = handleResult;

      setRecognizer(recognition);
    }

    navigator.mediaDevices.getUserMedia({ audio: true });
    alert(navigator.platform);
    setOs(navigator.platform);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#40128B] px-4">
      <Head>
        <title>Speech Recognition App</title>
      </Head>
      <button
        className={clsx(
          "border-2 rounded-full p-20 text-white",
          "hover:bg-white/75 hover:text-[#40128B] transition-all duration-300",
          "active:scale-95 active:bg-white/50",
          isListening
            ? "border-white animate-pulse bg-red-600"
            : "hover:border-[#40128B] border-white"
        )}
        // different for android
        onMouseDown={() => os !== ANDROID && start()}
        onMouseUp={() => os !== ANDROID && stop()}
        onTouchStart={() => os !== ANDROID && start()}
        onTouchCancel={() => os !== ANDROID && stop()}
        onTouchCancelCapture={() => os !== ANDROID && stop()}
        onTouchEnd={() => os !== ANDROID && stop()}
        onTouchEndCapture={() => os !== ANDROID && stop()}
        // different for android
        onClick={() => os === ANDROID && (isListening ? stop() : start())}
      >
        {isListening ? (
          <BsSquareFill className="font-bold text-6xl" />
        ) : (
          <BiMicrophone className="font-bold text-7xl" />
        )}
      </button>

      {result && (
        <p className="text-white text-2xl mt-4 text-center">{result}</p>
      )}

      <Link href="/">
        <div
          className="mt-4 flex items-center justify-center gap-1
          px-2 py-1 bg-none text-white hover:underline cursor-pointer"
        >
          <BsChevronLeft className="font-bold" />
          Kembali ke Gesture Recognizer
        </div>
      </Link>
    </main>
  );
}
