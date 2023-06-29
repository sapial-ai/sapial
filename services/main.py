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

from rich import print
from langchain.output_parsers import GuardrailsOutputParser
from langchain.prompts import PromptTemplate
from langchain.llms import OpenAI
import guardrails as gd

load_dotenv() #loads code from env file
app = FastAPI() #simple app

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

#pydantic class 
class StreamRequest(BaseModel):
    """Request body for streaming."""
    message: str

# ensure the API is working
@app.get("/")
async def root():
    return {"message": "Hello World"}

#Start of GuardRails Summary Integration 
#Moved summary feature to back-end
#open to token specifications & improved RailSpec
rail_str = """
    <rail version="0.1">

    <output>
    <string name="summary"/>
    </output>
    
    <prompt>
    You are a helpful and insightful AI text summarizer with an IQ of 125.
    You are able to summarize the given prompt below betweens humans and AI assistants.
    Your goal is to summarize our entire conversation in a way that is both accurate and concise.
    This summary will become the long-term memory of an AI assistant.

    Please extend the current summary based on our most recent messages.
    Make sure to retain a summary of our full conversation history.
    Please summarize it to the length of 2 sentences
    
    {{user_prompt}}

    @complete_json_suffix_v2
    </prompt>
    </rail>
"""
#@app.get("/chat/{prompt}/{template_context}"), possible next step
# call a model and return the full response
@app.get("/chat/{prompt}") #removed model string parameter
async def chat(prompt: str):  
    #Creates guard object 
    output_parser = GuardrailsOutputParser.from_rail_string(rail_str)

    #LangChain Call
    guard_prompt = PromptTemplate(
        template=output_parser.guard.base_prompt,
        input_variables=output_parser.guard.prompt.variable_names,
    )
    #model call 
    model_guard = OpenAI(temperature=0)

    #return a string 
    output = model_guard(guard_prompt.format_prompt(user_prompt = prompt).to_string())

    #format
    format_output = output_parser.parse(output)
    return {"message": format_output}

#call a model and stream the response back
@app.get("/stream/{model}/{prompt}")
def stream(model: str, prompt: str):
    return StreamingResponse(send_message(prompt, model), media_type="text/event-stream")
    
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




