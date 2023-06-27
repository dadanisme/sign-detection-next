import { Spinner, Button, Alert } from "@material-tailwind/react";
import { getCompletion, speak } from "@/services";
import { useState, useContext, useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

import { ChatContext } from "@/layouts";

import { BiMicrophone } from "react-icons/bi";
import Link from "next/link";
import { BsSquare } from "react-icons/bs";

const Video = dynamic(() => import("@/components/video"), { ssr: false });

interface Prediction {
  text: string;
  score: number;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>();
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  const [recognizer, setRecognizer] = useState<SpeechRecognition>();
  const [result, setResult] = useState<string>();
  const [isListening, setIsListening] = useState(false);

  const { addChat } = useContext(ChatContext);

  const handleSubmit = async () => {
    setLoading(true);
    setResponse("");

    const completion = await getCompletion(
      predictions.map((p) => p.text).join(", ")
    );
    speak(completion);

    setLoading(false);
    setResponse(completion);
    addChat({
      text: completion,
      name: "Gesture",
    });
  };

  const handleDelete = (index: number) => {
    setPredictions((prevState) => prevState.filter((_, i) => i !== index));
  };

  const start = () => {
    setResult(undefined);
    setIsListening(true);
    recognizer?.start();
  };

  const stop = () => {
    setIsListening(false);
    recognizer?.stop();

    addChat({
      text: result!,
      name: "Speech",
    });

    setTimeout(() => {
      setResult(undefined);
    }, 2000);
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
  }, []);

  return (
    <main className="flex min-h-screen flex-col md:items-center justify-between md:justify-center bg-[#40128B]">
      <Head>
        <title>Sistem Penerjemah Bahasa Isyarat</title>
      </Head>
      <h2 className="text-lg text-white font-semibold">
        Sistem Penerjemah Bahasa Isyarat
      </h2>
      <div className="w-max flex flex-col items-center justify-center relative">
        <Video responses={predictions} setResponses={setPredictions} />
        {result && (
          <div
            className="bg-black bg-opacity-50 absolute left-1/2 transform -translate-x-1/2 
            w-max max-w-[600px] text-white bottom-0 px-1"
          >
            {result}
          </div>
        )}
      </div>
      <div className="max-w-[600px] w-full mt-4">
        <div
          className="w-full h-16 bg-[#40128B] text-white p-4 rounded-lg outline-none resize-none
            border-2 border-white border-opacity-10 hover:border-opacity-50 transition-all duration-200
            flex gap-1 items-start flex-wrap words-wrapper"
          placeholder="Tulis gerakan tangan yang kamu inginkan"
        >
          {predictions.map((prediction, index) => (
            <div
              key={index}
              className="border border-white border-opacity-10 hover:border-opacity-50 hover:ring-2 hover:ring-white hover:ring-opacity-10
               px-2 py-0.5 cursor-pointer transition-all duration-200 rounded-md"
            >
              <p
                className="text-sm select-none"
                onClick={() => handleDelete(index)}
              >
                {prediction.text}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-2">
          <Button
            onClick={handleSubmit}
            color="deep-purple"
            className="w-32 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <Spinner color="deep-purple" /> : "Submit"}
          </Button>
          {response && predictions.length > 0 && (
            <div className="w-full flex-1 flex flex-col items-center justify-center">
              <p className="text-sm text-center text-white">{response}</p>
            </div>
          )}

          <button onClick={isListening ? stop : start}>
            {isListening ? (
              <BsSquare className="font-bold text-red-500 text-xl" />
            ) : (
              <BiMicrophone className="font-bold text-white text-2xl" />
            )}{" "}
          </button>
        </div>
      </div>
    </main>
  );
}
