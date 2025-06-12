from typing import Annotated, TypedDict, List, Literal, Optional
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from chains import (
    evaluator_chain,
    game_analysis_chain,
    game_analysis_prompt,
)
from langgraph.prebuilt import ToolNode
from langgraph.graph import StateGraph, END,add_messages
from tools import tools, search
import os
from dotenv import load_dotenv
import json
import sqlite3

load_dotenv()





class GraphState(TypedDict):
    input: str
    chat_history: List[BaseMessage]
    intent: Optional[Literal["game_analysis", "non_context"]]
    moves: Optional[str]
    fen: Optional[str]
    response: Optional[str]
    thread_id: Optional[str]


def evaluator_node(state: GraphState):


    human_msg = HumanMessage(content=state["input"])

    result = evaluator_chain.invoke(
        {
            "chat_history": state["chat_history"],
            "messages": [human_msg],
        }
    )

    print("Intent evaluation result:", result)

    return {
        **state,
        "intent": result.intent,
    }


def intent_router(state: GraphState):
    temp = state["intent"]
    if temp == "game_analysis":
        return "game_analysis"

    else:
        return "non_context"


def non_context_node(state: GraphState):

    return {
        **state,
        "response": "I'm here for anything chess-related. How can I assist you today?",
        "chat_history": state["chat_history"],
    }


def game_analysis_node(state: GraphState):
    user_question = state["input"]

 

    human_msg = HumanMessage(
        content=(
            f"Moves:\n{state['moves']}\n\n"
            f"Final position (FEN):\n{state['fen']}\n\n"
            f"User question:\n{user_question}"
        )
    )

    prompt = game_analysis_prompt.format(
        chat_history=state["chat_history"],
        messages=[human_msg],
    )
    print(prompt)

    result = game_analysis_chain.invoke(
        {
            "chat_history": state["chat_history"],
            "messages": [human_msg],
        }
    )

    return {
        **state,
        "response": result.content,
    }


# def search_node(state: GraphState):
#
#     human_msg = HumanMessage(content=state["input"])
#
#     result = search_chain.invoke(
#         {
#             "messages": [human_msg],
#         }
#     )
#
#     return {**state, "response": result.content, "messages": [result]}

#
# def tools_router(state: GraphState):
#     if not state.get("messages"):
#         return END
#
#     last_message = state["messages"][-1]
#     print("Last message:", hasattr(last_message, "tool_calls"))
#     if hasattr(last_message, "tool_calls"):
#         return "toolnode"
#
#     return END


# def execute_tools_node(state: GraphState) -> GraphState:
#     print("hello")
#     print(state)
#     last_ai_message = state["messages"][-1] if state.get("messages") else None
#     tool_messages = []
#     for tool_call in last_ai_message.tool_calls:
#         call_id = tool_call["id"]
#         search_queries = tool_call["args"].get("search_queries", [])
#
#         query_results = {}
#         for query in search_queries:
#             result = search.invoke(query)
#             query_results[query] = result
#
#         tool_messages.append(
#             ToolMessage(content=json.dumps(query_results), tool_call_id=call_id)
#         )
#
#     return {
#         **state,
#         "messages": state["messages"] + tool_messages,
#     }
#

graph = StateGraph(GraphState)
graph.add_node("evaluator", evaluator_node)
graph.add_node("game_analysis", game_analysis_node)
#graph.add_node("search_node", search_node)
#graph.add_node("toolnode", execute_tools_node)
graph.add_node("non_context", non_context_node)

graph.set_entry_point("evaluator")

#graph.add_edge("toolnode","search_node")
graph.add_conditional_edges("evaluator", intent_router, )
#graph.add_conditional_edges("search_node", tools_router, )


app=graph.compile()

# state = {
#     "input": "Which is my second move and what question did I ask you last?",
#     "chat_history": [],
#     "intent": None,
#     "moves" : (
#     "1. e4 (You) e5 (Opponent) "
#     "2. Nf3 (You) Nc6 (Opponent) "
#     "3. Bb5 (You) a6 (Opponent) "
#     "4. Ba4 (You) Nf6 (Opponent) "
#     "5. O-O (You) Be7 (Opponent) "
#     "6. Re1 (You) b5 (Opponent) "
#     "7. Bb3 (You) d6 (Opponent) "
#     "8. c3 (You) O-O (Opponent) "
#     "9. h3 (You) Nb8 (Opponent) "
#     "10. d4 (You) Nbd7 (Opponent) "
#     "11. c4 (You) c6 (Opponent) "
#     "12. cxb5 (You) axb5 (Opponent) "
#     "13. Nc3 (You) Bb7 (Opponent) "
#     "14. Bg5 (You) b4 (Opponent) "
#     "15. Na4 (You) c5 (Opponent) "
#     "16. dxe5 (You) Nxe4 (Opponent) "
#     "17. Bxe7 (You) Qxe7 (Opponent) "
#     "18. exd6 (You) Qf6 (Opponent) "
#     "19. Bd5 (You) Bxd5 (Opponent) "
#     "20. Qxd5 (You) Nxd6 (Opponent)"
# ),
#     "fen": "4r1k1/1b1nqppp/3n1r2/2pQ4/Np6/5P1P/PP3P2/R1B1R1K1 w - - 0 21",
#     "response": None,
#     "messages": [],
# }
#
# final_state = app.invoke(state)
# print("Final State:", final_state["response"])
#
#
#
