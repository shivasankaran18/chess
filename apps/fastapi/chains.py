from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_groq import ChatGroq
from pydantic import BaseModel
from typing import Literal
from models import evaluator_llm, game_llm,search_llm
from tools import tools

class IntentResult(BaseModel):
    intent: Literal["game_analysis", "search", "non_context"]


import os
from dotenv import load_dotenv


load_dotenv()

evaluator_prompt = ChatPromptTemplate.from_messages(
    [
        MessagesPlaceholder(variable_name="chat_history"),
        SystemMessage(
            content="""
You are a chess assistant that classifies the user's message into one of these three categories:

1. game_analysis — If the user wants help analyzing a move, a series of moves, or the overall game.
2. search — If the user is asking for news, events, player updates, or anything from the internet.
3. non_context — For greetings, casual chat, off-topic questions, or anything that doesn't require chess-specific logic.

Only respond with one of the following: game_analysis, search, non_context. 
Do not include any explanation or extra text.
"""
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        HumanMessage(content="{input}"),
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
- A chronological list of moves in Standard Algebraic Notation (SAN), along with who played each move.
- The final FEN string of the game.
- A user question about the game (e.g. what went wrong, critical moments, summary, or improvement suggestions).

Your job is to:
1. Carefully analyze the **move sequence**.
2. Understand the flow of the game: **opening, middlegame, and endgame**.
3. Evaluate positional and tactical imbalances without using an engine.
4. Identify key moments (inaccuracy, blunders, turning points) and explain them in **simple, instructive language**.
5. Be honest. If you can't analyze a detail, admit it.
6. If the user asks for improvement suggestions, provide clear, actionable advice.

Keep your tone warm, confident, and coach-like. Don’t guess or invent fake analysis.
"""
        ),
        HumanMessage(
            content="""
**Moves:**
{moves}

**Final Position (FEN):**
{fen}

**User's Question:**
{user_question}
"""
        ),
    ]
)

game_analysis_chain = game_analysis_prompt | game_llm

search_prompt = ChatPromptTemplate.from_messages(
    [
        MessagesPlaceholder(variable_name="chat_history"),
        SystemMessage(
            content="""
You are an AI assistant specializing in chess-related news, events, and real-world factual updates.

If the user asks about:
- Recent tournaments or events
- Player updates or rankings
- Chess news
- Anything current or real-world based

...you may use the search tool if required.

If the answer is known to you confidently, respond directly. Otherwise, invoke the appropriate search tool to find the information. Be brief, factual, and chess-focused.
"""
        ),
        HumanMessage(content="{user_question}"),
    ]
)

search_chain = search_prompt |  search_llm.bind_tools(tools=tools)



