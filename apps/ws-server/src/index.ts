import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import { GAME_JOIN, GAME_MOVE, INIT_GAME } from "utils/constants";
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

      switch (msg) {
         case INIT_GAME:
            let user1 = userManager.addUser(ws, data.user);
            await gameManager.createGame(user1);
            break;

         case GAME_JOIN:
            let user2 = userManager.addUser(ws, data.user);
            gameManager.startGame(parseInt(data.gameId), user2);
            break;

         case GAME_MOVE:
            let user = userManager.getUser(ws);
            if (!user) {
               ws.send(JSON.stringify({ type: "User not found" }));
               return;
            }
            console.log("reached here");
            gameManager.makeMove(data.move, user, parseInt(data.gameId));

         case "summa":
            ws.send(JSON.stringify({ type: "summa", data: "Hello from server!" }));
      }
   });
});
