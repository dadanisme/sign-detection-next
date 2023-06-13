import React from "react";
import {
  GestureRecognizer,
  FilesetResolver,
  GestureRecognizerOptions,
} from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";

import { useState, useEffect } from "react";
import { Spinner } from "@material-tailwind/react";
import Link from "next/link";
import { BsChevronRight } from "react-icons/bs";
import clsx from "clsx";

const WAIT_TIME = 1;

interface VideoProps {
  responses: string[];
  setResponses: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function Video({ responses, setResponses }: VideoProps) {
  const video = React.useRef<HTMLVideoElement>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);

  const [gesture, setGesture] = useState<GestureRecognizer>();
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [prediction, setPrediction] = useState<string>("");
  const [timer, setTimer] = useState<number>(0);

  const createGestureRecognizer = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    const options: GestureRecognizerOptions = {
      baseOptions: {
        modelAssetPath: "model.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
    };

    const gestureRecognizer = await GestureRecognizer.createFromOptions(
      vision,
      options
    );

    setGesture(gestureRecognizer);
  };

  const activateWebcam = async () => {
    video.current!.srcObject = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    setWebcamEnabled(true);
  };

  const predictWebcam = async () => {
    if (!canvas.current || !video.current || !gesture) return;
    const canvasContext = canvas.current.getContext("2d");

    if (!canvasContext) return;

    canvasContext.save();
    canvasContext.clearRect(0, 0, canvas.current.width, canvas.current.height);

    canvas.current.width = video.current.videoWidth;
    canvas.current.height = video.current.videoHeight;

    try {
      const results = gesture.recognizeForVideo(video.current, Date.now());

      if (results?.landmarks) {
        for (const landmark of results.landmarks) {
          drawConnectors(canvasContext, landmark, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 5,
          });
          drawLandmarks(canvasContext, landmark, {
            color: "#FF0000",
            lineWidth: 2,
          });
        }
      }

      canvasContext.restore();

      if (results?.gestures.length) {
        const categoryName = results?.gestures[0][0].categoryName;
        const categoryScore = (results?.gestures[0][0].score! * 100).toFixed(2);

        setPrediction(categoryName);
      }
    } catch (error) {
      console.log(error);
    }

    if (webcamEnabled) {
      window.requestAnimationFrame(predictWebcam);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((timer) => timer + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [prediction]);

  useEffect(() => {
    createGestureRecognizer();
  }, []);

  useEffect(() => {
    if (gesture) {
      activateWebcam();
    }
  }, [gesture]);

  useEffect(() => {
    video.current?.addEventListener("loadeddata", predictWebcam);

    return () => {
      video.current?.removeEventListener("loadeddata", predictWebcam);
    };
  }, [webcamEnabled]);

  useEffect(() => {
    if (timer <= WAIT_TIME) return;
    if (prediction) {
      setTimer(0);
      setResponses((responses) => {
        if (prediction === "None") {
          return responses;
        }

        if (responses.length === 0) {
          return [prediction];
        }

        if (responses[responses.length - 1] === prediction) {
          return responses;
        }

        return [...responses, prediction];
      });
    }
  }, [prediction]);

  if (!gesture) {
    return (
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Spinner color="deep-purple" scale={2} />
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <video
          ref={video}
          className="clear-both block h-full w-full rounded-lg"
          autoPlay
          muted
          playsInline
        ></video>
        <canvas
          className="z-[1] absolute pointer-events-none h-full w-full"
          style={{ position: "absolute", left: 0, top: 0 }}
          ref={canvas}
        ></canvas>
        <div
          className={clsx(
            "absolute -bottom-0.5 left-0",
            "bg-amber-600",
            "h-1",
            timer !== 0 && "transition-all duration-1000 ease-linear"
          )}
          style={{
            width: `${(timer / WAIT_TIME) * 100}%`,
            maxWidth: "100%",
          }}
        />
      </div>
      <Link href="/speech">
        <div
          className="mt-4 flex items-center justify-center gap-1
          px-2 py-1 bg-none text-white hover:underline cursor-pointer"
        >
          Speech to Text <BsChevronRight className="font-bold" />
        </div>
      </Link>
    </>
  );
}
