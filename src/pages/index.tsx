import { Spinner, Button } from "@material-tailwind/react";
import { getCompletion, speak } from "@/services";
import { useState, useContext } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

import { ChatContext } from "@/layouts";

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
      <div className="max-w-[600px] w-full flex flex-col items-center justify-center relative">
        <Video responses={predictions} setResponses={setPredictions} />
      </div>
      <div className="mb-20 md:mb-0 md:max-w-[600px] w-full px-4 md:px-0">
        <div className="flex items-center justify-center mt-4 w-full gap-2 flex-wrap max-h-32 overflow-auto">
          {predictions.map((prediction, index) => (
            <Button
              key={index}
              color="amber"
              className="px-2 py-1 rounded-md"
              onClick={() => handleDelete(index)}
            >
              {prediction.text} ({prediction.score.toFixed(2)}%)
            </Button>
          ))}
        </div>
        {predictions.length > 0 && (
          <Button
            onClick={handleSubmit}
            color="deep-purple"
            className="w-full flex items-center justify-center mt-4"
            disabled={loading}
          >
            {loading ? <Spinner color="deep-purple" /> : "Submit"}
          </Button>
        )}
        {response && predictions.length > 0 && (
          <div className="flex flex-col items-center justify-center mt-4">
            <p className="text-sm text-center text-white">{response}</p>
          </div>
        )}
      </div>
    </main>
  );
}
