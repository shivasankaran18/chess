import {
   CONNECT_PRODUCER_TRANSPORT,
   CREATE_PRODUCER_TRANSPORT,
   PRODUCER_GET_RTP_CAPABILITIES,
   PRODUCE,
   CONSUMER_GET_RTP_CAPABILITIES,
   CREATE_CONSUMER_TRANSPORT,
   CONNECT_CONSUMER_TRANSPORT,
   CONSUME,
   PRODUCE_VIDEO,
   CONSUME_VIDEO,
   PRODUCER_PAUSED_AUDIO,
   PRODUCE_AUDIO,
   CONSUME_AUDIO,
} from "utils/constants";
import * as mediasoupClient from "mediasoup-client";
import { RtpCapabilities } from "mediasoup-client/types";

export const getProducerRtpCapabilities = (
   ws: React.MutableRefObject<WebSocket | null>,
   id: number,
) => {
   if (ws.current == null) {
      return;
   }

   ws.current.send(
      JSON.stringify({
         type: PRODUCER_GET_RTP_CAPABILITIES,
         roomId: id,
      }),
   );
};

export const getConsumerRtpCapabilities = (
   ws: React.MutableRefObject<WebSocket | null>,
   id: number,
) => {
   if (ws.current == null) {
      return;
   }

   ws.current.send(
      JSON.stringify({
         type: CONSUMER_GET_RTP_CAPABILITIES,
         roomId: id,
      }),
   );
};

export const loadDevice = async (
   deviceRef: React.MutableRefObject<mediasoupClient.types.Device | null>,
   rtpCapabilities: RtpCapabilities,
   id: number,
) => {
   try {
      const device = new mediasoupClient.Device();
      await device.load({ routerRtpCapabilities: rtpCapabilities });
      deviceRef.current = device;
   } catch (e) {
      console.error("Error loading device:", e);
      return;
   }
};

export const requestProducerTransport = (
   socket: React.MutableRefObject<WebSocket | null>,
   rtpCapabilities: RtpCapabilities | undefined,
   id: number,
) => {
   if (!socket.current) {
      return;
   }

   socket.current.send(
      JSON.stringify({
         type: CREATE_PRODUCER_TRANSPORT,
         rtpCapabilities: rtpCapabilities,
         roomId: id,
      }),
   );
};

export const requestConsumerTransport = (
   socket: React.MutableRefObject<WebSocket | null>,
   rtpCapabilities: RtpCapabilities | undefined,
   id: number,
) => {
   if (!socket.current) {
      return;
   }

   socket.current.send(
      JSON.stringify({
         type: CREATE_CONSUMER_TRANSPORT,
         rtpCapabilities: rtpCapabilities,
         roomId: id,
      }),
   );
};

export const createSendTransport = async (
   params: any,
   socket: React.MutableRefObject<WebSocket | null>,
   device: React.MutableRefObject<mediasoupClient.types.Device | null>,
   sendTransport: React.MutableRefObject<mediasoupClient.types.Transport | null>,
   id: number,
   localVideo: React.MutableRefObject<HTMLVideoElement | null>,
   localStreamRef: React.MutableRefObject<MediaStream | null>,
   videoCallback: React.MutableRefObject<
      ((data: { id: string }) => void) | null
   >,
   audioCallback: React.MutableRefObject<
      ((data: { id: string }) => void) | null
   >,
) => {
   if (!socket.current || !device.current) {
      console.error("Socket or device is not initialized");
      return;
   }
   const transport = device.current.createSendTransport(params);
   sendTransport.current = transport;

   transport.on("connect", ({ dtlsParameters }, callback) => {
      socket?.current?.send(
         JSON.stringify({
            type: CONNECT_PRODUCER_TRANSPORT,
            dtlsParameters,
            roomId: id,
         }),
      );
      callback();
   });

   transport.on("produce", ({ kind, rtpParameters }, callback) => {
      console.log("Producing:", kind, rtpParameters);
      if (kind === "video") {
         socket.current?.send(
            JSON.stringify({
               type: PRODUCE_VIDEO,
               kind,
               rtpParameters,
               roomId: id,
            }),
         );
         videoCallback.current = callback;
      } else {
         socket.current?.send(
            JSON.stringify({
               type: PRODUCE_AUDIO,
               kind,
               rtpParameters,
               roomId: id,
            }),
         );
         audioCallback.current = callback;
      }
   });

   transport.on("connectionstatechange", (state) => {
      if (state === "failed") transport.close();
   });
   await startCamera(localVideo, sendTransport, localStreamRef);
};

export const createReceiveTransport = async (
   params: any,
   socket: React.MutableRefObject<WebSocket | null>,
   device: React.MutableRefObject<mediasoupClient.types.Device | null>,
   receiveTransport: React.MutableRefObject<mediasoupClient.types.Transport | null>,
   id: number,
   remoteVideo: React.MutableRefObject<HTMLVideoElement | null>,
   producerId: string | null,
   setShowVideoConsumeDialog: React.Dispatch<React.SetStateAction<boolean>>,
) => {
   if (!socket.current || !device.current) {
      console.error("Socket or device is not initialized");
      return;
   }
   const transport = device.current.createRecvTransport(params);
   receiveTransport.current = transport;

   transport.on("connect", ({ dtlsParameters }, callback) => {
      socket.current?.send(
         JSON.stringify({
            type: CONNECT_CONSUMER_TRANSPORT,
            dtlsParameters,
            roomId: id,
         }),
      );
      callback();
   });

   transport.on("connectionstatechange", (state) => {
      if (state === "connected") {
         console.log("Transport connected");
      }
      if (state === "failed") transport.close();
   });

   transport.on("icegatheringstatechange", (state) => {
      console.log("ICE state:", state);
   });
   setShowVideoConsumeDialog(true);
   // socket.current?.send(
   //    JSON.stringify({
   //       type: CONSUME_VIDEO,
   //       rtpCapabilities: device.current.rtpCapabilities,
   //       roomId: id,
   //       producerId: producerId,
   //    }),
   // );
};
export const consume = (
   socket: React.MutableRefObject<WebSocket | null>,
   device: React.MutableRefObject<mediasoupClient.types.Device | null>,
   id: number,
   producerIdRef: React.MutableRefObject<string | null>,
   kind: string,
) => {
   if (kind === "audio") {
      socket.current?.send(
         JSON.stringify({
            type: CONSUME_AUDIO,
            rtpCapabilities: device.current?.rtpCapabilities,
            roomId: id,
            producerId: producerIdRef.current,
         }),
      );
   } else {
      socket.current?.send(
         JSON.stringify({
            type: CONSUME_VIDEO,
            rtpCapabilities: device.current?.rtpCapabilities,
            roomId: id,
            producerId: producerIdRef.current,
         }),
      );
   }
};
const startCamera = async (
   localVideo: React.MutableRefObject<HTMLVideoElement | null>,
   sendTransport: React.MutableRefObject<mediasoupClient.types.Transport | null>,
   localStreamRef: React.MutableRefObject<MediaStream | null>,
) => {
   if (!localVideo.current || !sendTransport.current) {
      console.error("localVideoRef is null");
      return;
   }
   const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
   });
   localVideo.current.srcObject = stream;
   localStreamRef.current = stream;

   const videoTrack = stream.getVideoTracks()[0];
   const producer = await sendTransport.current.produce({
      track: videoTrack,
   });
};
