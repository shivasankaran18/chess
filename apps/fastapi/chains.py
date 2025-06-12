from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_groq import ChatGroq
from pydantic import BaseModel
from typing import Literal
from models import evaluator_llm, game_llm,search_llm
from tools import tools

class IntentResult(BaseModel):
    intent: Literal["game_analysis", "non_context"]


import os
from dotenv import load_dotenv


load_dotenv()

evaluator_prompt = ChatPromptTemplate.from_messages(
    [
        MessagesPlaceholder(variable_name="chat_history"),
        SystemMessage(
            content="""
You are a chess assistant that classifies the user's message into one of these two categories:

1. game_analysis — Use this if the user asks about anything related to a specific chess game they played or observed. 
This includes questions about moves, strategies, mistakes, openings, positions, evaluations, ideas, blunders, tactics, checkmate patterns, endgames, or general comments related to a specific chess game or move history.

2. non_context — Use this ONLY if the message is purely unrelated to any chess game or its analysis. 
This includes greetings, small talk, or general questions that do not refer to a specific game or move context at all.

Important guidelines:
- Always favor **game_analysis** if the message contains any reference to moves, game events, previous questions about moves, positions, or strategies — even if partially.
- Messages such as “what is my second move?” or “what did I ask before?” are considered **game_analysis** if they refer to game-related context or prior game discussion.
- Classify as **non_context** only when the message is entirely unrelated to games or move history (e.g., “hi”, “who are you?”, “tell me a joke”, “what can you do?”).

Your response must be exactly one of these two words, with no explanation: `game_analysis` or `non_context`.
"""
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)




print("hello")


evaluator_chain = evaluator_prompt | evaluator_llm.with_structured_output(IntentResult)

game_analysis_prompt = ChatPromptTemplate.from_messages(
    [
        MessagesPlaceholder(variable_name="chat_history"),
        SystemMessage(
            content="""
You are a highly skilled chess analyst and coach. You help players understand their games by analyzing move sequences and the final position of a completed chess match.

You are given:
- A chronological list of moves in Standard Algebraic Notation (SAN), alternating between White and Black.
- The final FEN string of the game.
- The color (White or Black) played by the user.
- A user question about the game (e.g. what went wrong, critical moments, summary, or improvement suggestions).

Your job is to:
1. Carefully analyze the **move sequence**, from the user's perspective (they played as {user_color}).
2. Understand the flow of the game: **opening, middlegame, and endgame**.
3. Evaluate positional and tactical imbalances without using an engine.
4. Identify key moments (inaccuracy, blunders, turning points) and explain them in **simple, instructive language**.
5. Be honest. If you can't analyze a detail, admit it.
6. If the user asks for improvement suggestions, provide clear, actionable advice.

Keep your tone warm, confident, and coach-like. Don’t guess or invent fake analysis.
"""
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)



game_analysis_chain = game_analysis_prompt | game_llm

# search_prompt = ChatPromptTemplate.from_messages(
#     [
#         MessagesPlaceholder(variable_name="chat_history"),
#         SystemMessage(
#             content="""
# You are an AI assistant specializing in chess-related news, events, and real-world factual updates.
#
# If the user asks about:
# - Recent tournaments or events
# - Player updates or rankings
# - Chess news
# - Anything current or real-world based
#
# ...you may use the search tool if required.
#
# If the answer is known to you confidently, respond directly. Otherwise, invoke the appropriate search tool to find the information. Be brief, factual, and chess-focused.
# """
#         ),
#         HumanMessage(content="{user_question}"),
#     ]
# )
#
# search_chain = search_prompt |  search_llm.bind_tools(tools=tools)
#
#
#
