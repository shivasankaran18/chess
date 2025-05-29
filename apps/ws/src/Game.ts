import WebSocket from "ws";
import { move } from "./types";
import { Chess } from "chess.js";

export class Game
{
   public player1:WebSocket;
   public player2:WebSocket;
   private board:Chess;
   private startTIme:Date;


   constructor(player1: WebSocket, player2: WebSocket)
   {
      this.player1 = player1;
      this.player2 = player2;
      this.board = new Chess();
      this.startTIme = new Date();

   }

   public makeMove(move:move ,player:WebSocket)
   {
      if(this.board.moves.length%2==0 && player !== this.player1)
      {
         this.player2.send(JSON.stringify({message: "It's not your turn"}));
      }
      if(this.board.moves.length%2==1 && player !== this.player2)
      {
         this.player1.send(JSON.stringify({message: "It's not your turn"}));
      }

      try
      {
         this.board.move(move);
      }
      catch (error)
      {
         return new Error("Invalid move");
      }

      if(this.board.isGameOver())
      {
         this.player1.emit("game_over", { winner: this.player2 === player ? "player2" : "player1" });
         this.player2.emit("game_over", { winner: this.player2 === player ? "player2" : "player1" });
         return; 
      }

      else
      {
         this.player1.send(JSON.stringify({ message: 'game_move', move: move, board: this.board.fen() }));
         this.player2.send(JSON.stringify({ message: 'game_move', move: move, board: this.board.fen() }));
      }

   }


}
