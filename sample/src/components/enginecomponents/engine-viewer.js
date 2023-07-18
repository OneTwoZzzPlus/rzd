import { useEffect, useCallback, useState } from "react";
import  { Unity, useUnityContext } from "react-unity-webgl";
import {MindARReact} from '../mindarcomponents/mindar-controller';



let srcVideo = null;
let mindArController = null;


export function EngineViewer(){
  
    const { unityProvider, addEventListener, removeEventListener, sendMessage, loadingProgression, isLoaded } =
        useUnityContext({
            loaderUrl: "./engine/UnityEngine.loader.js",
            dataUrl: "./engine/UnityEngine.data",
            frameworkUrl: "./engine/UnityEngine.framework.js",
            codeUrl: "./engine/UnityEngine.wasm",
            streamingAssetsUrl: "streamingassets",
        });

        
        function load(loadingPercentage){
          
          var obj = document.getElementById("Loadign_elems");
          obj.style.left = loadingPercentage + '%';
        }

        const loadingPercentage = Math.round(loadingProgression * 100);
         
        const [isOnboarding, setOnboarding] = useState(true);
        
        const [isCameraAllowed, setCameraAllowed] = useState(false);

        /*const poezd_width = document.getElementById("loading").getBoundingClientRect().width;*/
        


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
                  <p id = "App_title"> <font size="5"><strong>Мобильный помощник</strong></font><br></br> по правилам безопасного поведения <br></br>на объектах железнодорожной инфраструктуры </p>
                  <p id = "Percent"> ЗАГРУЗКА... {loadingPercentage} % </p>
                  <p id="RZD_logo"><img  src="./rzd_logo.png"></img></p>
                  <div className="Loading_poezd" style={{left: loadingPercentage}}/* onLoad={load}*/>
                    <img src="./poezd.png"></img> 
                  </div>
                  <div className="Loading_Line" style={{left: loadingPercentage}}>
                    <hr color="#ffffff" width="1024px" scale="10px"></hr>
                  </div>
                  
                </div> : null
              }
              <Unity unityProvider={unityProvider} style={{position: "center", width: "100%", height: "100%", overflow: "hidden", zIndex: 3}}/>  
            </div>
        );        
    }




