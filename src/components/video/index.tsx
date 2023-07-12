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

interface VideoProps {
  responses: Prediction[];
  setResponses: React.Dispatch<React.SetStateAction<Prediction[]>>;
}

interface Prediction {
  text: string;
  score: number;
}

export default function Video({ setResponses }: VideoProps) {
  const video = React.useRef<HTMLVideoElement>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);

  const [gesture, setGesture] = useState<GestureRecognizer>();
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [prediction, setPrediction] = useState<Prediction>();
  const [ping, setPing] = useState<number>(0);

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
      const start = window.performance.now();

      const results = gesture.recognizeForVideo(video.current, Date.now());

      const end = window.performance.now();
      const elapsed = end - start;

      setPing(elapsed);
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
        const categoryScore = results?.gestures[0][0].score! * 100;

        setPrediction({ text: categoryName, score: categoryScore });

        setResponses((responses) => {
          if (categoryName === "None" || categoryScore < 80 || !categoryName) {
            return responses;
          }

          if (
            responses.length > 0 &&
            responses[responses.length - 1].text === categoryName
          )
            return responses;

          return [...responses, { text: categoryName, score: categoryScore }];
        });
      }
    } catch (error) {
      console.log(error);
    }

    if (webcamEnabled) {
      window.requestAnimationFrame(predictWebcam);
    }
  };

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

  if (!gesture) {
    return (
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Spinner color="deep-purple" scale={2} />
      </div>
    );
  }

  return (
    <>
      <div className="relative h-96">
        <div className="absolute top-2 left-1/2 z-[5] transform -translate-x-1/2">
          <div className="bg-white text-black px-2 py-1 rounded-lg">
            {prediction?.text} ({prediction?.score.toFixed(2)}%)
          </div>
        </div>

        <div className="absolute bottom-2 left-2 z-[5]">
          <div className="bg-white text-black px-2 py-1 rounded-lg text-xs">
            {ping.toFixed(2)}ms
          </div>
        </div>

        <video
          ref={video}
          className="clear-both block h-96 rounded-lg"
          autoPlay
          muted
          playsInline
        ></video>
        <canvas
          className="z-[1] absolute pointer-events-none h-full w-full"
          style={{ position: "absolute", left: 0, top: 0 }}
          ref={canvas}
        ></canvas>
      </div>
    </>
  );
}
