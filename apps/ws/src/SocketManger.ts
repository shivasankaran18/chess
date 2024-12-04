import { WebSocket } from "ws";
import { authJWTType } from "./auth/auth";

export class User{
    public socket : WebSocket;
    public UserId : string;
    public name : string;

    constructor(socket: WebSocket,userAuthenticated : authJWTType){
        this.socket = socket;
        this.UserId = userAuthenticated.userId;
        this.name = userAuthenticated.name;
    }
}

export class SocketManger{
    private static instance : SocketManger;
    private interestedSockets : Map<String,User[]>;
    private userRoomMapping : Map<string,string>;

    private constructor(){
        this.interestedSockets = new  Map<string,User[]>();
        this.userRoomMapping = new Map<string,string>();
    }

    public static getIntance(){
        if(this.instance){
            this.instance = new SocketManger();
        }
        return this.instance;
    }

    addUser(user : User,roomId : string){
        this.interestedSockets.set(roomId,[
            ...(this.interestedSockets.get(roomId) || [] ),user
        ]);
        this.userRoomMapping.set(user.UserId,roomId);
    }

    broadCast(roomId : string,message: string){
        const users = this.interestedSockets.get(roomId);
        if(!users){
            return;
        }
        users.forEach((user)=>{ user.socket.send(message)});
    }

    removeUser(user : User){
        const roomId = this.userRoomMapping.get(user.UserId);
        if(!roomId) return;
        const room = this.interestedSockets.get(roomId) || [];
        const remainginUsers = room.filter(useri => useri.UserId === user.UserId);
        this.interestedSockets.set(roomId,remainginUsers);
        if(this.interestedSockets.get(roomId)?.length === 0){
            this.interestedSockets.delete(roomId);
        }
        this.userRoomMapping.delete(user.UserId);
    }
}