import React, { useEffect, useState } from "react";
import { BiMicrophone } from "react-icons/bi";
import { BsChevronLeft } from "react-icons/bs";
import Link from "next/link";
import Head from "next/head";

export default function Speech() {
  const [recognizer, setRecognizer] = useState<SpeechRecognition>();
  const [result, setResult] = useState<string>();

  const start = () => {
    setResult(undefined);
    recognizer?.start();
  };

  const stop = () => {
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
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#40128B] px-4">
      <Head>
        <title>Speech Recognition App</title>
      </Head>
      <button
        className="border-2 border-white rounded-full p-20 text-white
      hover:bg-white/75 hover:text-[#40128B] transition-all duration-300
      hover:border-[#40128B] active:scale-95 active:bg-white/50"
        onMouseDown={start}
        onMouseUp={stop}
        onTouchStart={start}
        onTouchCancel={stop}
        onTouchCancelCapture={stop}
        onTouchEnd={stop}
      >
        <BiMicrophone className="font-bold text-7xl" />
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
