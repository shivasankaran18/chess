class Chat:
    def __init__(self,thread_id,game_id,user_id,moves,fen,chat_history):
        self.thread_id = thread_id
        self.game_id = game_id
        self.user_id = user_id
        self.moves = moves
        self.fen = fen
        self.chat_history = chat_history





class ChatManager:
    def __init__(self):
        self.chats = {}

    def createChat(self, thread_id, game_id, user_id, moves, fen, chat_history):
        if thread_id in self.chats:
            raise ValueError("Chat already exists")
        
        chat = Chat(thread_id, game_id, user_id, moves, fen, chat_history)
        self.chats[thread_id] = chat
        return chat

    def updateChatHistory(self, thread_id, message):
        if thread_id not in self.chats:
            raise ValueError("Chat does not exist")
        
        self.chats[thread_id].chat_history.append(message)
