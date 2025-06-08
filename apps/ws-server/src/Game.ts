import WebSocket from "ws";
import { move, Moves,Message } from "utils/types";
import { Chess } from "chess.js";
import { User } from "./User";
import {
   GAME_MOVE,
   INVALID_MOVE,
   WRONG_PLAYER,
   WAIT_FOR_THE_SECOND_PLAYER,
   GAME_OVER,
   GAME_MSG,
} from "utils/constants";
import { RedisManager } from "./RedisManager";

const redisManager=RedisManager.getInstance();

export class Game {
   public id: number;
   public player1: User;
   public player2: User | null;
   public board: Chess;
   private startTime: Date;
   private moves:Moves
   private messages: Message[];


   constructor(id: number, player1: User, player2?: User) {
      this.id = id;
      this.player1 = player1;
      this.player2 = player2 ?? null;
      this.board = new Chess();
      this.startTime = new Date();
      this.moves = [];
      this.messages = [];
   }

   public makeMove(move: move, user: User): void {
      if (!this.player2) {
         this.player1.socket.send(
            JSON.stringify({ type: WAIT_FOR_THE_SECOND_PLAYER }),
         );
         return;
      }
      if (
         (this.board.turn() === "w" && user === this.player1) ||
         (this.board.turn() === "b" && user === this.player2)
      ) {
         if (this.board.move(move)) {

            this.moves=[...this.moves,{from:move.from,to:move.to, player:user.user.name,timestamp: new Date()}];
            if (this.board.isGameOver()) {
               const winner =
                  this.board.turn() === "w" ? this.player2 : this.player1;
               const loser =
                  this.board.turn() === "w" ? this.player1 : this.player2;
               redisManager.addMove(
                  this.id,
                  move.from,
                  move.to,
                  user.user.id,
                  this.board.fen(),
               )
               redisManager.endGame(
                  this.id,
                  "COMPLETED",
                  winner.user.id,
               )

               winner?.socket.send(
                  JSON.stringify({
                     type: GAME_OVER,
                     winner: winner.user.email,
                     loser: loser?.user.email,
                  }),
               );
               loser?.socket.send(
                  JSON.stringify({
                     type: GAME_OVER,
                     winner: winner.user.email,
                     loser: loser?.user.email,
                  }),
               );
            } else {
               redisManager.addMove(
                  this.id,
                  move.from,
                  move.to,
                  user.user.id,
                  this.board.fen(),
               );
               
               this.player1.socket.send(
                  JSON.stringify({
                     type: GAME_MOVE,
                     move,
                     moves: this.moves,
                  }),
               );
               this.player2?.socket.send(
                  JSON.stringify({
                     type: GAME_MOVE,
                     move,
                     moves: this.moves,
                  }),
               );
            }
         } else {
            console.log(`Invalid move by ${user.user.name} in game ${this.id}`);
            user.socket.send(JSON.stringify({ type: INVALID_MOVE }));
         }
      } else {
         user.socket.send(JSON.stringify({ type: WRONG_PLAYER }));
      }
   }

   public sendMessage(message: string, user: User): void {
      const msg: Message = {
         text: message,
         name: user.user.name,
         timestamp: new Date(),
      };
      this.messages.push(msg);
      this.player1.socket.send(JSON.stringify({ type: GAME_MSG, messages:this.messages }));
      this.player2?.socket.send(JSON.stringify({ type: GAME_MSG, messages:this.messages }));
   }


}
