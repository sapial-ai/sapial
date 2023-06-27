from dotenv import load_dotenv
from ..main import app
from langchain.chat_models import ChatOpenAI
from langchain.schema import (
    AIMessage,
    HumanMessage,
    SystemMessage
)

load_dotenv()
chat = ChatOpenAI(temperature=0)

# Write a generic function 'call' to call the model with any generic prompt and return the response
@app.get("/call/{prompt}")
def call(prompt: str):
    response = chat.predict_messages([HumanMessage(content=prompt)])
    print(response)
    return {"message": response }
