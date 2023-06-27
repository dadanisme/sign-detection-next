import { Spinner, Button } from "@material-tailwind/react";
import { getCompletion, speak } from "@/services";
import { useState, useContext } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

import { ChatContext } from "@/layouts";

import { BiMicrophone } from "react-icons/bi";
import Link from "next/link";

const Video = dynamic(() => import("@/components/video"), { ssr: false });

interface Prediction {
  text: string;
  score: number;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>();
  const [predictions, setPredictions] = useState<Prediction[]>([]);

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

  return (
    <main className="flex min-h-screen flex-col md:items-center justify-between md:justify-center bg-[#40128B]">
      <Head>
        <title>Sign Detection App</title>
      </Head>
      <h2 className="text-lg text-white font-semibold">
        Deteksi Gerakan Tangan
      </h2>
      <div className="max-w-[600px] w-full flex flex-col items-center justify-center relative">
        <Video responses={predictions} setResponses={setPredictions} />
      </div>
      <div className="max-w-[600px] w-full mt-4">
        <div
          className="w-full h-24 bg-[#40128B] text-white p-4 rounded-lg outline-none resize-none
            border-2 border-white border-opacity-10 hover:border-opacity-50 transition-all duration-200
            flex gap-1 items-start flex-wrap words-wrapper
            "
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

        <div className="flex items-center justify-between">
          <Button
            onClick={handleSubmit}
            color="deep-purple"
            className="w-32 flex items-center justify-center mt-4"
            disabled={loading}
          >
            {loading ? <Spinner color="deep-purple" /> : "Submit"}
          </Button>
          {response && predictions.length > 0 && (
            <div className="w-full flex-1 flex flex-col items-center justify-center mt-4">
              <p className="text-sm text-center text-white">{response}</p>
            </div>
          )}

          <Link href="/speech">
            <BiMicrophone className="text-white text-2xl cursor-pointer" />
          </Link>
        </div>
      </div>
    </main>
  );
}
