

class User:
    def __init__(self,socket,id,name,email,image):
        self.socket = socket
        self.id = id
        self.name = name
        self.email = email
        self.image = image


class UserManager:
    def __init__(self):
        self.users = {}

    def add_user(self, socket, user_data):
        if socket in self.users:
            raise ValueError("User already exists")

        user= User(
            socket=socket,
            id=user_data.get("id"),
            name=user_data.get("name"),
            email=user_data.get("email"),
            image=user_data.get("image")
        )
        self.users[socket] = user
        return user

    def get_user(self, socket):
        return self.users.get(socket)

    def delete_user(self, socket):
        if socket in self.users:
            del self.users[socket]
        else:
            raise ValueError("User does not exist")

