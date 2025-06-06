import {
   CONNECT_PRODUCER_TRANSPORT,
   CREATE_PRODUCER_TRANSPORT,
   PRODUCER_GET_RTP_CAPABILITIES,
   PRODUCE,
   CONSUMER_GET_RTP_CAPABILITIES,
   CREATE_CONSUMER_TRANSPORT,
   CONNECT_CONSUMER_TRANSPORT,
   CONSUME,
} from "utils/constants";
import * as mediasoupClient from "mediasoup-client";
import { RtpCapabilities } from "mediasoup-client/types";

export const getProducerRtpCapabilities = (
   ws: WebSocket | null,
   id: number,
) => {
   if (ws == null) {
      return;
   }

   ws.send(
      JSON.stringify({
         type: PRODUCER_GET_RTP_CAPABILITIES,
         roomId: id,
      }),
   );
};

export const getConsumerRtpCapabilities = (
   ws: WebSocket | null,
   id: number,
) => {
   if (ws == null) {
      return;
   }

   ws.send(
      JSON.stringify({
         type: CONSUMER_GET_RTP_CAPABILITIES,
         roomId: id,
      }),
   );
};

export const loadDevice = async (
   deviceRef: any,
   rtpCapabilities: RtpCapabilities,
   id: number,
) => {
   try {
      console.log("Loading device with RTP capabilities:", rtpCapabilities);
      const device = new mediasoupClient.Device();
      await device.load({ routerRtpCapabilities: rtpCapabilities });
      deviceRef.current = device;
      console.log("Device loaded successfully", device);
   } catch (e) {
      console.error("Error loading device:", e);
      return;
   }
};

export const requestProducerTransport = (
   socket: WebSocket | null,
   rtpCapabilities: RtpCapabilities | undefined,
   id: number,
) => {
   console.log("gelo");
   if (!socket) {
      return;
   }
   console.log("Reached here requestProducerTransport");

   socket.send(
      JSON.stringify({
         type: CREATE_PRODUCER_TRANSPORT,
         rtpCapabilities: rtpCapabilities,
         roomId: id,
      }),
   );
};

export const requestConsumerTransport = (
   socket: WebSocket | null,
   rtpCapabilities: RtpCapabilities | undefined,
   id: number,
) => {
   if (!socket) {
      return;
   }

   socket.send(
      JSON.stringify({
         type: CREATE_CONSUMER_TRANSPORT,
         rtpCapabilities: rtpCapabilities,
         roomId: id,
      }),
   );
};

export const createSendTransport = async (
   params: any,
   socket: WebSocket,
   device: mediasoupClient.types.Device,
   sendTransport: mediasoupClient.types.Transport | null,
   id: number,
   localVideo: HTMLVideoElement | null,
) => {
   const transport = device.createSendTransport(params);
   sendTransport = transport;

   transport.on("connect", ({ dtlsParameters }, callback) => {
      socket.send(
         JSON.stringify({
            type: CONNECT_PRODUCER_TRANSPORT,
            dtlsParameters,
            roomId: id,
         }),
      );
      callback();
   });

   transport.on("produce", ({ kind, rtpParameters }, callback) => {
      socket.send(
         JSON.stringify({ type: PRODUCE, kind, rtpParameters, roomId: id }),
      );
   });

   transport.on("connectionstatechange", (state) => {
      if (state === "failed") transport.close();
   });
   console.log("📡 Transport created", transport.id);
   await startCamera(localVideo, sendTransport);
};

export const createReceiveTransport = async (
   params: any,
   socket: WebSocket,
   device: mediasoupClient.types.Device,
   receiveTransport: mediasoupClient.types.Transport | null,
   id: number,
   remoteVideo: HTMLVideoElement | null,
) => {
   const transport = device.createRecvTransport(params);
   receiveTransport = transport;


   transport.on("connect", ({ dtlsParameters }, callback) => {
      socket.send(
         JSON.stringify({
            type: CONNECT_CONSUMER_TRANSPORT,
            dtlsParameters,
            roomId: id,
         }),
      );
      callback();
   });

   transport.on("connectionstatechange", (state) => {
         console.log("🧭 Consumer transport state:", state);
         if (state === "connected") {
            socket.send(
               JSON.stringify({
                  type: CONSUME,
                  rtpCapabilities: device.rtpCapabilities,
               })
            );
         }
         if (state === "failed") transport.close();
      });


};

const startCamera = async (
   localVideo: HTMLVideoElement | null,
   sendTransport: mediasoupClient.types.Transport | null,
) => {
   if (!localVideo || !sendTransport) {
      console.error("localVideoRef is null");
      return;
   }
   const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
   });
   console.log("📹 Camera stream started", stream);
   localVideo.srcObject = stream;

   const videoTrack = stream.getVideoTracks()[0];
   const producer = await sendTransport.produce({
      track: videoTrack,
   });

   console.log("📡 Producing track", producer.id);
};
