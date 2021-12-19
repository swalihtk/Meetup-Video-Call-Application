import React, {useEffect, useState, useRef} from 'react'
import "../styles/Meeting.css";
import {Container} from "react-bootstrap";
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import MicNoneIcon from '@material-ui/icons/MicNone';
import MicOffIcon from '@material-ui/icons/MicOff';
import CallEndIcon from '@material-ui/icons/CallEnd';
import ChatIcon from '@material-ui/icons/Chat';
import Peer from 'peerjs';
import socketIoClient from 'socket.io-client';
import {useParams} from 'react-router-dom';

function Meeting() {

    // own video
    let videoGrid=useRef();
    let [myVideoStream, setMyVideoStream]=useState(undefined);
    let [videoOn, setVideoOn]=useState(false);
    let [muteOn, setMuteOn]=useState(false);

    // roomId
    let {id:roomId}=useParams();
    

    // peer and socketio setup 
    let peer=new Peer();
    let socketIo=socketIoClient("http://localhost:4000");
  
    useEffect(async()=>{
        peer.on("open", (id)=>{
            socketIo.emit("create-room", id, roomId);
        })
    }, [])

    // setup camera
    useEffect(async()=>{
        let myVideo=document.createElement("video");
        let myStream=await window.navigator.mediaDevices.getUserMedia({audio:false, video:true});
        appendOwnVideoToDiv(myVideo, myStream);
        setMyVideoStream(myStream);
        setVideoOn(true);


        // answering to call
        answerToCall(myStream);
        
        // calling and socket connnection
        socketIo.on("join-user", (userId)=>{
            callToUser(userId, myStream);
        })
        
    }, [])
    
    // checking videos length
    function setVideoResponsive(){
        let videosLength=document.getElementsByClassName("video").length;
        if(videosLength>1){
            document.getElementById("myVideo").classList+=" minimizeVideo";
        }
    }

    // calling to user
    function callToUser(userId, mediaStream){
        // if(!mediaStream) return;
        const call = peer.call(userId,mediaStream);

        call.on("stream", stream=>{
            let video=document.createElement("video");
            appendOthersVideoToDiv(video,stream)

            setVideoResponsive();
        })
    }

    // answering to call
    function answerToCall(mediaStream){
        peer.on('call', function(call) {
            // Answer the call, providing our mediaStream
            call.answer(mediaStream);

            call.on('stream', function(stream) {
                // `stream` is the MediaStream of the remote peer.
                // Here you'd add it to an HTML video/canvas element.
                let video=document.createElement("video");
                appendOthersVideoToDiv(video, stream);

                setVideoResponsive();
              });
          });
    }

    // function for video appending (own video)
    function appendOwnVideoToDiv(video, stream){
        // video element setup
        video.srcObject=stream;
        video.addEventListener("loadedmetadata", ()=>video.play());
        
        // div creation and setup
        let div=document.createElement("div");
        div.setAttribute("class", "video");
        div.setAttribute("id", "myVideo")
        div.appendChild(video);

        // div appending to parent
        videoGrid.current.appendChild(div);
    }

    // function for video appending (roomates video)
    function appendOthersVideoToDiv(video, stream){
        // video element setup
        video.srcObject=stream;
        video.addEventListener("loadedmetadata", ()=>video.play());

         // div creation and setup
         let div=document.createElement("div");
         div.setAttribute("class", "video");
         div.appendChild(video);
 
         // div appending to parent
         videoGrid.current.appendChild(div);
    }

    // handle video mute and audio mute
    function handleVideoMute(){
        if(myVideoStream.getVideoTracks()[0].enabled){
            myVideoStream.getVideoTracks()[0].enabled=false;
            setVideoOn(false);
        }else{
            myVideoStream.getVideoTracks()[0].enabled=true;
            setVideoOn(true);
        }
    }
    function handleAudioMute(){
        if(myVideoStream.getAudioTracks()[0].enabled){
            myVideoStream.getAudioTracks()[0].enabled=false;
            setMuteOn(true);
        }else{
            myVideoStream.getAudioTracks()[0].enabled=true;
            setMuteOn(false);
        }
    }


    return (
        <div className="meet__main">
            <Container>
                <div className="row">
                    <div className="col-12 meet__video" ref={videoGrid}>
                        {/* Videos appends here */}
                    </div>
                    <div className="col-12 meet__footer">
                        <div className="meet__details">
                            <p>Swalih | klsldklsdk</p>
                        </div>
                        <div className='meet__options'>
                            {
                            videoOn?
                             <VideocamOffIcon onClick={handleVideoMute} style={{cursor:"pointer"}}/>
                             :
                             <VideocamIcon onClick={handleVideoMute} style={{cursor:"pointer"}}/>
                            }
                            {
                                muteOn?
                                <MicOffIcon onClick={handleAudioMute} style={{cursor:"pointer"}}/>
                                :
                                <MicNoneIcon onClick={handleAudioMute} style={{cursor:"pointer"}}/>
                            }
                            
                            <CallEndIcon style={{color:"red"}}/>
                        </div>
                        <div className='meet__chat'>
                            <ChatIcon />
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default Meeting
