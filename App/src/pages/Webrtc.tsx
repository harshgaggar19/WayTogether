import React, { useEffect, useRef, useState } from "react";

const WebRTCComponent = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [userId, setUserId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [incomingCall, setIncomingCall] = useState<string | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<HTMLAudioElement | null>(null);
  const ringtone = useRef(new Audio("https://www.fesliyanstudios.com/play-mp3/4385")); // 🎵 Ringtone

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");
    ws.onopen = () => console.log("Connected to WebSocket");

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);

      switch (data.type) {
        case "incoming-call":
          ringtone.current.play(); // 🔔 Play ringtone
          setIncomingCall(data.from); // Show alert UI
          break;

        case "offer":
          handleOffer(data.offer, data.from);
          break;

        case "answer":
          handleAnswer(data.answer);
          break;

        case "ice-candidate":
          if (peerConnection.current) {
            peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
          break;
      }
    };

    setSocket(ws);
  }, []);

  const joinServer = () => {
    if (userId && socket) {
      socket.send(JSON.stringify({ type: "join", userId }));
    }
  };

  const startCall = async () => {
    if (!targetId) return alert("Enter target user ID!");

    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnection.current.ontrack = (event) => {
      if (remoteStreamRef.current) {
        remoteStreamRef.current.srcObject = event.streams[0];
      }
    };

    localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.current.getTracks().forEach((track) => peerConnection.current!.addTrack(track, localStream.current!));

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate, target: targetId }));
      }
    };

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket?.send(JSON.stringify({ type: "offer", offer, target: targetId, userId }));
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    ringtone.current.pause(); // ⏸ Stop ringtone
    ringtone.current.currentTime = 0;

    setTargetId(incomingCall);
    setIncomingCall(null);

    socket?.send(JSON.stringify({ type: "accept", userId, target: incomingCall }));
  };

  const declineCall = () => {
    ringtone.current.pause(); // ⏸ Stop ringtone
    ringtone.current.currentTime = 0;

    setIncomingCall(null);
  };

  const handleOffer = async (offer, from) => {
    setTargetId(from);

    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnection.current.ontrack = (event) => {
      if (remoteStreamRef.current) {
        remoteStreamRef.current.srcObject = event.streams[0];
      }
    };

    localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.current.getTracks().forEach((track) => peerConnection.current!.addTrack(track, localStream.current!));

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate, target: from }));
      }
    };

    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket?.send(JSON.stringify({ type: "answer", answer, target: from }));
  };

  const handleAnswer = async (answer) => {
    await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
  };

  return (
    <div>
      <h2>WebRTC Audio Call</h2>
      <input type="text" placeholder="Your ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
      <button onClick={joinServer}>Join</button>

      <input type="text" placeholder="Target ID" value={targetId} onChange={(e) => setTargetId(e.target.value)} />
      <button onClick={startCall}>Call</button>

      <h3>Remote Audio</h3>
      <audio ref={remoteStreamRef} autoPlay />

      {/* Call Notification */}
      {incomingCall && (
        <div className="incoming-call">
          <p>Incoming call from {incomingCall}</p>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={declineCall}>Decline</button>
        </div>
      )}
    </div>
  );
};

export default WebRTCComponent;
