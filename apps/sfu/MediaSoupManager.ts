import * as mediasoup from "mediasoup";

let worker: mediasoup.types.Worker;

const startMediasoup = async () => {
   worker = await mediasoup.createWorker();

   console.log("Mediasoup router created");
};

export const createRouter = async () => {
   const router = await worker.createRouter({
      mediaCodecs: [
         {
            kind: "audio",
            mimeType: "audio/opus",
            clockRate: 48000,
            channels: 2,
         },
         {
            kind: "video",
            mimeType: "video/VP8",
            clockRate: 90000,
            parameters: {},
         },
      ],
   });
   return router;
};

startMediasoup();

export const getRouterRtpCapabilities = (router:mediasoup.types.Router) => {
   return router?.rtpCapabilities;
};

let transports = [];

export async function createWebRtcTransport(router: mediasoup.types.Router) {
   const transport = await router?.createWebRtcTransport({
      listenIps: [{ ip: "127.0.0.1", announcedIp: undefined }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
   });

   transports.push(transport);

   return {
      params: {
         id: transport.id,
         iceParameters: transport.iceParameters,
         iceCandidates: transport.iceCandidates,
         dtlsParameters: transport.dtlsParameters,
      },
      transport,
   };
}
