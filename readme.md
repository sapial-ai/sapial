![Static Badge](https://img.shields.io/badge/future_is-here-blue)
![Static Badge](https://img.shields.io/badge/sapial-ai?label=SapialAI&link=https%3A%2F%2Fsapial.ai)
![GitHub contributors](https://img.shields.io/github/contributors/sapial-ai/sapial?labelColor=purple)
![GitHub last commit (branch)](https://img.shields.io/github/last-commit/sapial-ai/sapial/main)

# Sapial
Semi-Autonomous Personal Intelligent Agent from Large language models

Sapial is a open framework for building personal agents that can be trained on your own data. It is built on top of [Deno](https://deno.land/), [Transforemrs](), [Langchain](), and [llama-index]().

Why Deno? 

## Architecture
Sapial is broadly divided into three parts:
1. Python backend services, exposed over local FastAPI bridge
2. Deno runtime (middleware), for running the agent
3. Client Interfaces, that connect to the Deno runtime via local HTTP API


## Setup
1. Install [Deno](https://deno.com/runtime)
2. Install [Python](https://www.python.org/) and [Pip](https://pip.pypa.io/en/stable/installation/) 
3. Setup a Python [Virtual Environment](https://www.freecodecamp.org/news/how-to-setup-virtual-environments-in-python/)
4. Install Python Dependencies
5. Install Deno Dependencies


## Installation
```bash
    
    git clone sapial  
    cd sapial
    pip install -r ./services/requirements.txt

    # run the agent (first terminal)
    deno run --allow-all --unstable ./agents/alice.ts

    # run the CLI (second terminal)
    cd /clients/cli
    deno run --allow-all httpClient.ts

    # add OpenAI API keys to .env file

```


## Debug
Kill the fastAPI server on agent crash
lsof -i :8000 -> <PID>
kill -9 <PID>

## Next Steps Implementation
- add formatting to text
- start implementing basic agent architectures 
- add a retriever using llama-index
- tools and plugins

# Final Sharing
- share notes and repo with Andrew 

## Next Steps Planning
- define personas
- define personal alignment stratgies

## Later
- Refactor http server to be a class
- Add authentication for agents and clients using LibP2P
