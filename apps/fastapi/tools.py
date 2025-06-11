from langchain_community.tools import TavilySearchResults
import os
from dotenv import load_dotenv
load_dotenv()

search = TavilySearchResults(api_key=os.environ["TAVILY_API_KEY"])


tools = [search]
