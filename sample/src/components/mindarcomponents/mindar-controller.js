import { Matrix4, Vector3, Quaternion } from "three";
import {Controller} from 'mind-ar/dist/mindar-image.prod.js';


export class MindARReact{
    constructor({
        video, imageTargetSrc
    }) {
        this.video = video
        this.imageTargetSrc = imageTargetSrc
        this.anchors = [];
    }


    async initiateAR(){
        await this._initiateAR();
    }


    addAnchor(targetIndex) {
        const anchor = { visible: false, isMatrixComputed: false, matrix: null, targetIndex, onTargetFound: null, onTargetLost: null, onTargetUpdate: null };
        this.anchors.push(anchor);
        return anchor;
    }    


    start(){
        this.controller.processVideo(this.video);
    }


    stop(){
        this.controller.stopProcessVideo();
    }


    async _initiateAR(){
       return new Promise(async (resolve, reject)=>{
            this.controller = new Controller({
                inputWidth: this.video.videoWidth,
                inputHeight: this.video.videoHeight,
                onUpdate: (data) => {
                    if(data.type === 'updateMatrix'){
                        const { targetIndex, worldMatrix } = data;
                        for (let i = 0; i < this.anchors.length; i++) {
                            if (this.anchors[i].targetIndex === targetIndex) {
                                this.anchors[i].isMatrixComputed = worldMatrix !== null;
                               


                                if(worldMatrix !== null){
                                    let m = new Matrix4();
                                    m.elements= [...worldMatrix];
                                    m.multiply(this.postMatrixs[targetIndex]);
                                    this.anchors[i].matrix = m;
                                }


                                if(this.anchors[i].visible && worldMatrix === null){
                                    this.anchors[i].visible = false;
                                    if(this.anchors[i].onTargetLost){
                                        this.anchors[i].onTargetLost(i);
                                    }
                                }


                                if (!this.anchors[i].visible && worldMatrix !== null) {
                                    this.anchors[i].visible = true;
                                    if (this.anchors[i].onTargetFound) {
                                    this.anchors[i].onTargetFound(i);
                                    }
                                }
                               
                                if (this.anchors[i].visible && this.anchors[i].onTargetUpdate) {
                                    this.anchors[i].onTargetUpdate(this.anchors[i]);
                                }  
                            }            
                        }
                    }
                }
            });


            this.postMatrixs = [];
            const { dimensions: imageTargetDimensions } = await this.controller.addImageTargets(this.imageTargetSrc);


            for (let i = 0; i < imageTargetDimensions.length; i++) {
                const position = new Vector3();
                const quaternion = new Quaternion();
                const scale = new Vector3();
                const [markerWidth, markerHeight] = imageTargetDimensions[i];
                position.x = markerWidth / 2;
                position.y = markerWidth / 2 + (markerHeight - markerWidth) / 2;
                scale.x = markerWidth;
                scale.y = markerWidth;
                scale.z = markerWidth;
                const postMatrix = new Matrix4();
                postMatrix.compose(position, quaternion, scale);
                this.postMatrixs.push(postMatrix);
            }
           
            await this.controller.dummyRun(this.video);
           
            this.controller.processVideo(this.video);
            var targetCount = imageTargetDimensions.length;


            this.anchors = [];
            for(var i=0; i<targetCount; i++){
                const anchor = this.addAnchor(i);
                anchor.onTargetFound = function(i){
                  window.onDetected(i);
                }
                anchor.onTargetLost = function(i){
                  window.onLost(i);
                }
               
                anchor.onTargetUpdate = function(trackable){
                  window.onUpdate(trackable)
                }
            }  
            resolve();  
        })
    }
}
