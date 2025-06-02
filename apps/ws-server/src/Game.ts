import WebSocket from "ws";
import { move } from "utils/types";
import { Chess } from "chess.js";
import { User } from "./User";
import {
   GAME_MOVE,
   INVALID_MOVE,
   WRONG_PLAYER,
   WAIT_FOR_THE_SECOND_PLAYER,
} from "utils/constants";

export class Game {
   public id: number;
   public player1: User;
   public player2: User | null;
   private board: Chess;
   private startTIme: Date;
   private movesCount: number;

   constructor(id: number, player1: User, player2?: User) {
      this.id = id;
      this.player1 = player1;
      this.player2 = player2 ?? null;
      this.board = new Chess();
      this.startTIme = new Date();
      this.movesCount = 0;
   }

   public makeMove(move: move, user: User): void {
      console.log(
         `User ${user.user.name} is making a move in game ${this.id}: ${move}`,
      );
      if (!this.player2) {
         console.log(`Game ${this.id} is waiting for the second player.`);
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
            this.movesCount++;

            if (this.board.isGameOver()) {
               const winner =
                  this.board.turn() === "w" ? this.player2 : this.player1;
               const loser =
                  this.board.turn() === "w" ? this.player1 : this.player2;

               winner?.socket.send(
                  JSON.stringify({ type: "You win!", gameOver: true }),
               );
               loser?.socket.send(
                  JSON.stringify({ type: "You lose!", gameOver: true }),
               );
            } else {
                     console.log(this.board.board());
               this.player1.socket.send(
                  JSON.stringify({ type: GAME_MOVE, move }),
               );
               this.player2?.socket.send(
                  JSON.stringify({ type: GAME_MOVE, move }),
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
}
