//@ts-ignore
import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";


const gameManager=GameManager.getInstance();

const wss=new WebSocketServer({port:8089})


wss.on('connection',(ws:any)=>{
    gameManager.addUser(ws);    
    
    ws.on("message",(msg:string)=>{
        
    })

    ws.on('close',()=>{
        gameManager.removeUser(ws);
    })



});

