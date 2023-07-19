import { useEffect, useCallback, useState } from "react";
import  { Unity, useUnityContext } from "react-unity-webgl";
import {MindARReact} from '../mindarcomponents/mindar-controller';



let srcVideo = null;
let mindArController = null;


export function EngineViewer(){
  
    const { unityProvider, addEventListener, removeEventListener, sendMessage, loadingProgression, isLoaded } =
        useUnityContext({
            loaderUrl: "./engine/pr.loader.js",
            dataUrl: "./engine/pr.data",
            frameworkUrl: "./engine/pr.framework.js",
            codeUrl: "./engine/pr.wasm",
            streamingAssetsUrl: "streamingassets",
        });

        const loadingPercentage = Math.round(loadingProgression * 100);
         
        const [isOnboarding, setOnboarding] = useState(true);
        
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
                <div className="loading-overlay" style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "#E21A1A", display: "flex", zIndex: 4}}>                  
                  <p id = "App_title"> <font size="5"><strong>Мобильный помощник</strong></font><br></br> по правилам безопасного поведения <br></br>на объектах железнодорожной инфраструктуры <br></br> <br></br> <font size="5"><strong>Добро пожаловать!</strong></font></p>
                  <p id = "Percent"> ЗАГРУЗКА... {loadingPercentage} % </p>
                  <p id="RZD_logo"><img  src="./rzd_logo.png"></img></p>
                  <div className="Loading_poezd" style={{left: loadingPercentage * 2}}/* onLoad={load}*/>
                    <img src="./poezd.png"></img> 
                  </div>
                  <hr id="line" color="#ffffff" width={window.screen.width}></hr>
                  
                </div> : null
              }
              <Unity unityProvider={unityProvider} style={{position: "absoute", width: "100%", height: "100%", overflow: "hidden", zIndex: 3}}/>  
            </div>
        );        
    }




