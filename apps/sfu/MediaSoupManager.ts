import * as mediasoup from "mediasoup";

let worker : mediasoup.types.Worker  
let router: mediasoup.types.Router;

const startMediasoup = async () => {
  worker = await mediasoup.createWorker();
  router = await worker.createRouter({
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

  console.log("Mediasoup router created");
};

startMediasoup();

 export const getRouterRtpCapabilities = () => {
  return router?.rtpCapabilities;
};


let transports = [];

export async function createWebRtcTransport() {
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


module.exports = {
  getRouterRtpCapabilities,
   createWebRtcTransport,
};


