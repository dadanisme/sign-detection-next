import { Spinner, Input } from "@material-tailwind/react";
import { getCompletion, speak } from "@/services";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>();

  const handleEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setLoading(true);
      setResponse("");

      const completion = await getCompletion(e.currentTarget.value);
      speak(completion);

      setLoading(false);
      setResponse(completion);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-[600px] w-full flex flex-col items-center justify-center">
        <Input
          variant="static"
          // label="Enter Words"
          onKeyDown={handleEnter}
          className="text-center"
          placeholder="Enter Words"
        />
        {loading && <Spinner className="mt-4" color="gray" />}

        {response && (
          <div className="flex flex-col items-center justify-center mt-4">
            <p className="text-sm text-center">{response}</p>
          </div>
        )}
      </div>
    </main>
  );
}
