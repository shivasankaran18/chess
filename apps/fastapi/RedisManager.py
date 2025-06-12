import redis.asyncio as redis
import json

class RedisManager:
    def __init__(self, host='localhost', port=6379, db=0):
        self.redis = redis.Redis(host=host, port=port, db=db)


    def push(self,data):
        self.redis.rpush("chat",json.dumps(data))
