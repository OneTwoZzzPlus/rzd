import { useEffect, useCallback, useState } from "react";
import  { Unity, useUnityContext } from "react-unity-webgl";
import {MindARReact} from '../mindarcomponents/mindar-controller';


let srcVideo = null;
let mindArController = null;


export function EngineViewer(){
    const { unityProvider, addEventListener, removeEventListener, sendMessage, loadingProgression, isLoaded } =
        useUnityContext({
            loaderUrl: "./engine/ar.loader.js",
            dataUrl: "./engine/ar.data",
            frameworkUrl: "./engine/ar.framework.js",
            codeUrl: "./engine/ar.wasm",
            streamingAssetsUrl: "streamingassets",
        });
       
        const [isOnboarding, setOnboarding] = useState(true);
        const loadingPercentage = Math.round(loadingProgression * 100);
        const [isCameraAllowed, setCameraAllowed] = useState(false);


        const handleStartEngine = useCallback(()=>{
            setOnboarding(false);
        });        


        window.onDetected = (index) => {
            sendMessage("[EntryPoint]", "WebGlBridgeDetected", index);
        }  
       
        window.onUpdate = (trackable) => {
            if(trackable){
              let matrixJson = JSON.stringify(trackable.matrix);
              sendMessage("[EntryPoint]", "WebGlBridgeSetMatrix", matrixJson);
            }
        }      
       
        window.onLost = (index) => {
            sendMessage("[EntryPoint]", "WebGlBridgeLost", index);
        }  
       
        useEffect(()=>{
            addEventListener("OnStartEngine", handleStartEngine);
            return ()=>{
              removeEventListener("OnStartEngine", handleStartEngine);
            };
        }, [addEventListener, removeEventListener, handleStartEngine]);      
       
        useEffect(()=>{
            window.onWebcamVideoStart = (deviceId, activeWebCams) =>{
              var device = activeWebCams[deviceId];
              console.log("start",device);
              srcVideo = device.video;
              srcVideo.addEventListener("loadedmetadata", ()=>{
                console.log(srcVideo);  
                srcVideo.setAttribute("width", srcVideo.videoWidth);
                srcVideo.setAttribute("height", srcVideo.videoHeight);
                setCameraAllowed(true);
                if(mindArController === null){
                  mindArController = new MindARReact({
                    imageTargetSrc: "./streamingassets/targets.mind",
                    video: srcVideo,
                  });
                  mindArController.initiateAR();
                } else {
                  mindArController?.start();
                }
              })
            };


            window.onWebcamVideoStop = (deviceId, activeWebCams) =>{
              var device = activeWebCams[deviceId];
              console.log("stop",device);
              srcVideo = null;
              setCameraAllowed(false);
              mindArController?.stop();
            }
        }, []);    
       
        return (
            <div className="engine">
              {isOnboarding ?
                <div className="loading-overlay" style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "whitesmoke", display: "flex", zIndex: 4}}>
                  <p>ЗАГРУЗКА... {loadingPercentage}%</p>
                </div> : null
              }
              <Unity unityProvider={unityProvider} style={{position: "absoute", width: "100%", height: "100%", overflow: "hidden", zIndex: 3}}/>  
            </div>
        );        
    }
