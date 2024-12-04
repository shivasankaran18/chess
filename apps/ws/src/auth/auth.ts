import jwt from "jsonwebtoken";
import { WebSocket } from "ws";
import { User } from "../SocketManger";

const JWT_SECRET = "player";

export interface authJWTType{
    userId : string,
    name : string
}

export const authMiddleWare = (token : string,ws : WebSocket) =>{
    const user = jwt.verify(token,JWT_SECRET) as authJWTType;
    return new User(ws,user);
}