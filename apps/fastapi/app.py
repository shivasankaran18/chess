from collections import UserDict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from langchain_core.messages import HumanMessage, AIMessage
import uuid
import asyncio
from ChatManager import ChatManager
from UserManager import UserManager
from graph import app
from pydantic_core.core_schema import none_schema
from utils import  format_moves_for_chat
from prisma import Prisma

prisma = Prisma()

server=FastAPI()

userManager= UserManager()
chatManager= ChatManager()

@server.on_event("startup")
async def startup():
    await prisma.connect()

@server.on_event("shutdown")
async def shutdown():
    await prisma.disconnect()

@server.websocket("/ws")
async def websocket_endpoint(ws:WebSocket):
    await ws.accept()
    thread_id = None
    user=None
    chat=None
    try:
        while True:
            data = await ws.receive_json()
            print("Received data:", data)

            if(data["type"]=="init"):
                print(data)
                user=userManager.add_user(ws,data["user"])
                thread_id = str(uuid.uuid4())

                moves=await prisma.move.find_many(
                where= {
                    "gameId":data["game_id"]
                }
                )

                game= await prisma.game.find_unique(
                    where={
                        "id": data["game_id"]
                        }
                )

                print("Game found:", moves)
                moves= format_moves_for_chat(moves, user.id)
                print("Formatted moves:", moves)
                fen = game.currentFen
                chat=chatManager.createChat(
                    thread_id=thread_id,
                    game_id=data["game_id"],
                    user_id=user.id,
                    moves=moves,
                    fen=fen,
                    chat_history=[]
                )

                await ws.send_json({"type": "init_ack", "thread_id": thread_id})
            

            elif(data["type"]=="message"):  
                input_message = data["message"]
                chatManager.updateChatHistory(thread_id, HumanMessage(content=input_message))
                result = await app.ainvoke({
                    "input": input_message,
                    "chat_history": chatManager.chats[thread_id].chat_history,
                    "intent":None,
                    "response": None,
                    "moves": chatManager.chats[thread_id].moves,
                    "fen": chatManager.chats[thread_id].fen,
                    "thread_id": thread_id
                })
                ai_response = result["response"]
                chatManager.updateChatHistory(thread_id, AIMessage(content=ai_response))

                await ws.send_json({
                    "type": "response",
                    "message": ai_response
                })
    except WebSocketDisconnect:
        print("WebSocket disconnected")
