import React, { useEffect, useState } from "react";
import { BiMicrophone } from "react-icons/bi";
import { BsChevronLeft, BsSquareFill } from "react-icons/bs";
import Link from "next/link";
import Head from "next/head";
import clsx from "clsx";

const ANDROID = "linux";

export default function Speech() {
  const [recognizer, setRecognizer] = useState<SpeechRecognition>();
  const [result, setResult] = useState<string>();
  const [os, setOs] = useState<string>();
  const [isListening, setIsListening] = useState(false);

  const start = () => {
    setResult(undefined);
    os?.toLocaleLowerCase().includes(ANDROID) && setIsListening(true);
    recognizer?.start();
  };

  const stop = () => {
    os?.toLocaleLowerCase().includes(ANDROID) && setIsListening(false);
    recognizer?.stop();
  };

  const handleResult = (event: SpeechRecognitionEvent) => {
    setResult(event.results[0][0].transcript);
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return alert("Speech Recognition tidak didukung");

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "id-ID";

      recognition.onresult = handleResult;

      setRecognizer(recognition);
    }

    navigator.mediaDevices.getUserMedia({ audio: true });
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
        onMouseDown={() =>
          !os?.toLocaleLowerCase().includes(ANDROID) && start()
        }
        onMouseUp={() => !os?.toLocaleLowerCase().includes(ANDROID) && stop()}
        onTouchStart={() =>
          !os?.toLocaleLowerCase().includes(ANDROID) && start()
        }
        onTouchCancel={() =>
          !os?.toLocaleLowerCase().includes(ANDROID) && stop()
        }
        onTouchEnd={() => !os?.toLocaleLowerCase().includes(ANDROID) && stop()}
        // different for android
        onClick={() =>
          os?.toLocaleLowerCase().includes(ANDROID) &&
          (isListening ? stop() : start())
        }
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
