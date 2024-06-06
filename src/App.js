import React, { useRef, useEffect,useState } from "react";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import { drawHand } from "./Utilities";
import * as fp from "fingerpose";
import Handsigns from "./handsigns";
import * as tf from "@tensorflow/tfjs"
import "./App.css"; // Import CSS file for styling
function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [predictions, setPredictions] = useState([]);
  const [curr, setCurr] = useState();
  const[loaded,setloaded]=useState(false);
  const detectitRef = useRef(true);
    // Function to update predicted word based on the most frequent letter
    
    // Function to handle delete button click
const handleDelete = () => {
  setPredictions(prevPredictions => {
    const newPredictions = [...prevPredictions];
    newPredictions.pop(); // Remove the last element from the predictions list
    return newPredictions;
  });
};

// Function to handle space button click
const handleSpace = () => {
  setPredictions(prevPredictions => [...prevPredictions, " "]); // Add a space element to the predictions list
};
//stop camera 
const toggledetect = () => {
  // setdetectit((prevDetectit) => !prevDetectit);
  detectitRef.current = !detectitRef.current;
  if (!detectitRef.current) {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }
};
const convertToSpeech = () => {
  const speechSynthesis = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(predictions.join(''));
  speechSynthesis.speak(utterance);
};

const runHandpose = async () => {
    await tf.ready();
    console.log("TensorFlow.js loaded.");
    const net = await handpose.load();
    console.log("Handpose model loaded.");

    const GE = new fp.GestureEstimator([
      Handsigns.aSign,
      Handsigns.bSign,
      Handsigns.cSign,
      Handsigns.dSign,
      Handsigns.eSign,
      Handsigns.fSign,
      Handsigns.gSign,
      Handsigns.hSign,
      Handsigns.iSign,
      Handsigns.jSign,
      Handsigns.kSign,
      Handsigns.lSign,
      Handsigns.mSign,
      Handsigns.nSign,
      Handsigns.oSign,
      Handsigns.pSign,
      Handsigns.qSign,
      Handsigns.rSign,
      Handsigns.sSign,
      Handsigns.tSign,
      Handsigns.uSign,
      Handsigns.vSign,
      Handsigns.wSign,
      Handsigns.xSign,
      Handsigns.ySign,
      Handsigns.zSign,
    ]);
    console.log("Fingerpose model loaded.");

    setInterval(() => {
      if(detectitRef.current){
        detect(net, GE);
      }
    }, 100);

 
  };
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (curr && curr !== predictions[predictions.length - 1]) {
        setPredictions(prevPredictions => [...prevPredictions, curr]);
      }
    }, 2000);
  
    return () => clearInterval(intervalId);
  }, [curr,predictions]); // Include predictions in the dependency array to monitor changes in predictions array
  

  const detect = async (net, GE) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
  
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      
      const hand = await net.estimateHands(video);
      console.log("hand", hand);
      setloaded(true);
  
      if (hand.length > 0) {
        const estimatedGestures = await GE.estimate(hand[0].landmarks, 6.5);
        console.log(estimatedGestures, "gestureestimate");
        
        if (
          estimatedGestures &&
          estimatedGestures.gestures &&
          estimatedGestures.gestures.length > 0
        ) {
          console.log("find index")
          const confidence = estimatedGestures.gestures.map(p => p.score);
          const maxConfidence = confidence.indexOf(Math.max.apply(undefined, confidence));
          console.log(maxConfidence,"dsklfsd",confidence)
            const predictedLetter = estimatedGestures.gestures[maxConfidence].name;
            console.log("Predicted letter:", predictedLetter);
            setCurr(predictedLetter);
        }
  
        const ctx = canvasRef.current.getContext("2d");
        drawHand(hand, ctx);
        
      }
    }
  };
  
  useEffect(() => {
    runHandpose();
  });

  return (
    <div className="App">
    <header className="App-header">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "640px",
            marginTop: "15px",
            marginBottom:"0px"
          }}
        >
          <Webcam
            ref={webcamRef}
            style={{ width: "100%", height: "auto", zIndex: 9 }}
          />
          <canvas
            ref={canvasRef}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 9 }}
          />
        </div>
        <div style={{ width: "100%", maxWidth: "640px" }}>
         {loaded ?  "":<p>Few seconds to load our model...</p>}
          <p>Predicted Word: {predictions.join("")}</p>
          <p>Current Prediction: {curr}</p>
          <button onClick={handleDelete} style={{ margin: "2px" }}>
            Delete
          </button>
          <button onClick={handleSpace} style={{ margin: "2px" }}>
            Space
          </button>
          <button onClick={convertToSpeech} style={{ margin: "2px" }}>
            Convert to Speech
          </button>
          <button onClick={toggledetect} style={{ margin: "2px" }}>
            {detectitRef.current ? "Stop Detection" : "Start Detection"}
          </button>
        </div>
      </div>
    </header>
  </div>
  );
}

export default App;
