import { RTP_CAPABILITIES } from "utils/constants"


export const getRtpCapabilities = (ws:WebSocket | null)=> {
   if(ws==null) {
      return;
   }

   ws.send(JSON.stringify({
      type:RTP_CAPABILITIES,
   }));
}
