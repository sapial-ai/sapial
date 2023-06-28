import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from typing import AsyncIterable, Awaitable
import asyncio
from langchain.llms import OpenAI
from langchain.callbacks.streaming_aiter import AsyncIteratorCallbackHandler
from pydantic import BaseModel

from langchain.chat_models import ChatOpenAI
from langchain.schema import (
    AIMessage,
    HumanMessage,
    SystemMessage
)

load_dotenv()
app = FastAPI()

# from https://gist.github.com/ninely/88485b2e265d852d3feb8bd115065b1a
# see also https://github.com/hwchase17/langchain/discussions/1706
async def send_message(message: str, model: str) -> AsyncIterable[str]:
    callback = AsyncIteratorCallbackHandler()
    model = ChatOpenAI(
        streaming=True,
        verbose=True,
        callbacks=[callback],
        model=model,
    )

    async def wrap_done(fn: Awaitable, event: asyncio.Event):
        """Wrap an awaitable with a event to signal when it's done or an exception is raised."""
        try:
            await fn
        except Exception as e:
            # TODO: handle exception
            print(f"Caught exception: {e}")
        finally:
            # Signal the aiter to stop.
            event.set()

    # Begin a task that runs in the background.
    task = asyncio.create_task(wrap_done(
        model.agenerate(messages=[[HumanMessage(content=message)]]),
        callback.done),
    )

    async for token in callback.aiter():
        # Use server-sent-events to stream the response
        yield token

    await task

class StreamRequest(BaseModel):
    """Request body for streaming."""
    message: str

# ensure the API is working
@app.get("/")
async def root():
    return {"message": "Hello World"}

# # call a model and stream the response back
@app.get("/stream/{model}/{prompt}")
def stream(model: str, prompt: str):
    return StreamingResponse(send_message(prompt, model), media_type="text/event-stream")

# call a model and return the full response
@app.get("/chat/{model}/{prompt}")
def chat(model: str, prompt: str):
    chat = ChatOpenAI(temperature=0, model=model)
    response = chat.predict_messages([HumanMessage(content=prompt)])
    return {"message": response }
    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")

# # load a local model using transformers
# @api.get("/load/{model}")
# def loadModel(self):
#     return

# # train a model
# @api.get("/train/{model}/{data}")
# def trainModel(self, model: str, data: str):
#     return

# # load a retriever
# @api.get("/load/{retriever}")
# def loadRetriever(self, retriever: str):
#     return

# # call a retriever
# @api.get("/call/{retriever}/{query}}")
# def callRetriever(self, retriever: str, query: str):
#     return

# # ingest data into a retriever
# @api.get("/ingest/{retriever}/{data}")
# def ingestRetriever(self, retriever: str, data: str):
#     return




