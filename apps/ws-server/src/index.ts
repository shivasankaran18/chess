import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import { GAME_JOIN, GAME_MOVE, GAME_MSG, INIT_GAME } from "utils/constants";
import { User } from "./User";
import { UserManagaer } from "./UserManager";

const wss = new WebSocketServer({ port: 8080 });

const gameManager = GameManager.getInstance();
const userManager = UserManagaer.getInstance();
wss.on("connection", (ws) => {
   //TODO:authenticate user

   ws.on("message", async (body: any) => {
      
      let data = JSON.parse(body.toString());
      let msg = data.type;

      console.log(`Received message: ${msg} with data:`, data);
      let user: User | undefined;


      switch (msg) {
         case INIT_GAME:
            user = userManager.addUser(ws, data.user);
            await gameManager.createGame(user);
            break;

         case GAME_JOIN:
            user = userManager.addUser(ws, data.user);
            gameManager.startGame(parseInt(data.gameId), user);
            break;

         case GAME_MOVE:
            user = userManager.getUser(ws);
            if (!user) {
               ws.send(JSON.stringify({ type: "User not found" }));
               return;
            }
            gameManager.makeMove(data.move, user, parseInt(data.gameId));
            break;

         case GAME_MSG:
            user= userManager.getUser(ws);
            if (!user) {
               ws.send(JSON.stringify({ type: "User not found" }));
               return;
            }
            gameManager.sendMessage(data.message, user, parseInt(data.gameId));
         
      }
   });
});
