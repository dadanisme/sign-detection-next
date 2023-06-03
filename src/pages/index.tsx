import { Spinner, Chip, Button } from "@material-tailwind/react";
import { getCompletion, speak } from "@/services";
import { useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

const Video = dynamic(() => import("@/components/video"), { ssr: false });

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>();
  const [predictions, setPredictions] = useState<string[]>([]);

  const handleSubmit = async () => {
    setLoading(true);
    setResponse("");

    const completion = await getCompletion(predictions.join(", "));
    speak(completion);

    setLoading(false);
    setResponse(completion);
  };

  const handleDelete = (index: number) => {
    setPredictions((prevState) => prevState.filter((_, i) => i !== index));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#40128B]">
      <Head>
        <title>Sign Detection App</title>
      </Head>
      <div className="max-w-[600px] w-full flex flex-col items-center justify-center relative">
        <Video responses={predictions} setResponses={setPredictions} />
        <div className="flex items-center justify-center mt-4 w-full gap-2 flex-wrap">
          {predictions.map((prediction, index) => (
            <Button
              key={index}
              color="deep-purple"
              className="px-2 py-1 rounded-md"
              onClick={() => handleDelete(index)}
            >
              {prediction}
            </Button>
          ))}
        </div>

        <div className="mt-6 w-full">
          {predictions.length > 0 && (
            <Button
              onClick={handleSubmit}
              color="deep-purple"
              className="w-full flex items-center justify-center"
              disabled={loading}
            >
              {loading ? <Spinner color="deep-purple" /> : "Submit"}
            </Button>
          )}
        </div>

        {response && predictions.length > 0 && (
          <div className="flex flex-col items-center justify-center mt-4">
            <p className="text-sm text-center text-white">{response}</p>
          </div>
        )}
      </div>
    </main>
  );
}
