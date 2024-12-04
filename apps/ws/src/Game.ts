import {Chess, Move, Square} from "chess.js"
import { GAME_ENDED, INIT_GAME, MOVE } from "./messages"
import { SocketManger, User } from "./SocketManger";

type GAME_RESULT = "white_wins" | "black_wins" | "draw";
type GAME_STATUS = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'TIME_UP' | 'PLAYER_EXIT';

function isPromoting(board : Chess,from : Square, to : Square){
    if(!from) return false;
    const cell = board.get(from);
    if(cell.type !== 'p') return false;
    if(cell.color !== board.turn()) return false;
    if(!['1','8'].some((i) => to.endsWith(i))) return false;

    return board.moves({square:from,verbose:true}).map((i) => i.to).includes(to);
}
export class Game{
    public gameId : string;
    public player1Id : string;
    public player2Id : string | null;
    public board : Chess;
    public movesCount : number = 0;
    public result : GAME_RESULT | null;
    private player1TimeTaken = 0;
    private player2TimeTaken = 0;
    private startTime = new Date(Date.now());
    private lastMoveTime = new Date(Date.now());


    constructor(player1Id : string,player2Id : string | null, gameId : string | null,startTime? : Date){
        this.player1Id = player1Id;
        this.player2Id = player2Id;
        this.gameId = gameId ?? this.getRandom();
        this.board =new Chess();
        this.result = null;
        if(startTime){
            this.startTime = startTime;
            this.lastMoveTime = startTime;
        }
    }
    getRandom(){
        return Math.random().toString().substring(2,15) + Math.random().toString().substring(2,15);
    }

    seedMoves(moves : {
        id: string,
        gameId : string,
        moveNumber : number,
        from : string,
        to : string,
        comments : string | null,
        timeTake : number | null,
        createAt : Date
    }[]){
        moves.forEach((move : any) => {
            if(isPromoting(this.board,move.from as Square, move.to as Square)){
                this.board.move({
                    from:move.from,
                    to:move.to,
                    promotion:'q'
                })
            } else {
                this.board.move({
                    from:move.from,
                    to: move.to
                })
            }
        })
        this.movesCount = moves.length;
        if(moves[moves.length-1]){
            this.lastMoveTime = moves[moves.length -1].createAt;
        }
        moves.map((move,index) =>{
            if(move.timeTake){
                if(index % 2 === 0) this.player1TimeTaken += move.timeTake;
                else this.player2TimeTaken += move.timeTake;
            }
        })
    }
    updateSecondPlayer = async(player2Id :string) =>{
        this.player2Id = player2Id;
        // const whitePlayer = get the white player from the db or the redis.
        // const blackPlayer = get the black playyer from the db or the redis.

        SocketManger.getIntance().broadCast(
            this.gameId,
            JSON.stringify({
                type: INIT_GAME,
                payload:{
                    gameId : this.gameId,
                    whitePlayer:{
                        id : this.player1Id
                    },
                    blackPlayer:{
                        id: this.player2Id
                    },
                    fen : this.board.fen(),
                    moves:[]
                }
            })
        )
    }
    makeMove = async(user : User,move: Move) =>{
        if(this.board.turn() === "w" && user.UserId !== this.player1Id) return;
        if(this.board.turn() === "b" && user.UserId !== this.player2Id) return;

        if(this.result){
            console.log("The game has already ended");
            return;
        }
        const moveTime = new Date(Date.now());
        try{
            if(isPromoting(this.board,move.from,move.to)){
                this.board.move({
                    from: move.from,
                    to : move.to,
                    promotion: "q"
                })
            } else {
                this.board.move({
                    from : move.from,
                    to : move.to,
                })
            }
        } catch(e){
            console.log(e);
            return;
        }
        if(this.board.turn() === "w"){
            this.player1TimeTaken = this.player1TimeTaken + (moveTime.getTime() - this.lastMoveTime.getTime());
        } else {
            this.player2TimeTaken = this.player2TimeTaken + (moveTime.getTime() - this.lastMoveTime.getTime());
        }
        this.lastMoveTime = moveTime;
        SocketManger.getIntance().broadCast(
            this.gameId,
            JSON.stringify({
                type: MOVE,
                payload:{
                    move,
                    player1TimeConsumed : this.player1TimeTaken,
                    player2TimeConsumed : this.player2TimeTaken
                }
            })
        )
        if(this.board.isGameOver()){
            const result = this.board.isDraw() ? "draw" : this.board.turn() === "b" ? "white_wins" : "black_wins";
            this.endGame("COMPLETED",result);
        }
        this.movesCount++;
    }
    endGame = async(status : GAME_STATUS,result : GAME_RESULT) =>{
        SocketManger.getIntance().broadCast(
            this.gameId,
            JSON.stringify({
                type : GAME_ENDED,
                payload:{
                    result,
                    status,
                    // move : should put the moves for that game from the db or redis
                    blackPlayer:{
                        id : this.player2Id,
                        // name : get from the db
                    },
                    whitePlayer: {
                        id : this.player1Id
                    }
                }
            })
        )
    }
}