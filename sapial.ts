import { IConfig } from "./interfaces.ts";
import * as proc from "https://deno.land/x/proc@0.20.28/mod3.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { guidelines, role } from "./runtime/prompts/prompts.ts";
import fs from 'node:fs';
import YAML from 'yaml';
// import { estimateTokens } from "./runtime/utils/utils.ts";

export class Sapial {
    public readonly name: string;
    public readonly primaryModel: string;
    public readonly secondaryModel: string;
    private memory: boolean;
    private summarizeChat = false;
    private chatSummary = ``;
    private bufferChat = false;
    private chatBuffer: string[] = [];
    private readonly contextSize = 16_384;
    private readonly conversatationSummarySize = 4_096;
    private readonly messageBufferSize = 4_096;
    private store: Deno.Kv;

    constructor(config: IConfig, store: Deno.Kv ) {
        this.name = config.name;
        this.primaryModel = config.primaryModel;
        this.secondaryModel = config.secondaryModel;
        this.memory = config.memory;
        this.store = store; 
                
        if (config.memory) {
            this.summarizeChat = true;
            this.bufferChat = true;
        }

        // setup the proxy server
        const handler = async (request: Request) => {
            const humanMessage = await request.text();
            console.log(`Human message: ${humanMessage}`);
            const humanMessageWithContext = this.injectContext(humanMessage);
            console.log(`Human message with context: ${humanMessageWithContext}`);
            const streamingResponse = await this.streamLLM(humanMessageWithContext);
            const { readable, writable } = new TransformStream<Uint8Array>;
            const [responseReadable, localReadable] = readable.tee()
            streamingResponse.body!.pipeTo(writable);
            if (this.memory) {
                this.streamToString(localReadable).then( async (AIMessage) => {
                    console.log(`AI response: ${AIMessage}`)
                    await this.addMessagePairToBuffer(humanMessage, AIMessage);
                    this.summarizeChatHistory()
                });
            }
            return new Response(responseReadable);
        };

        serve(handler, { port: 4242 });
    }

    // create a new root sapial agent from a new config object
    public static async init(config: IConfig) {
        console.log("being called")
        // start the uvicron API server for python services
        proc.run("bash", "run.sh");    
        console.log("Started API service");

        const store = await Deno.openKv();

        // create the sapial agent
        const sapial = new Sapial(config, store);
        return sapial;
    }

    async streamToString(stream: ReadableStream) {
        const reader = stream.getReader();
        const decoder = new TextDecoder("utf-8");
        let result = "";
      
        while (true) {
          const { done, value } = await reader.read();
      
          if (done) {
            return result;
          }
      
          result += decoder.decode(value);
        }
    }

    // adds a new message exchange to the chat buffer and logs
    async addMessagePairToBuffer(humanMessage: string, AIMessage: string) {

        const messagePair = `
            --human-message--
            ${humanMessage}
            --human-message--

            --ai-message--
            ${AIMessage}
            --ai-message--
            `;

        console.log(`Added the follow message to the chat buffer: ${messagePair}`);

        this.chatBuffer.push(messagePair.toString());
        const timestamp = Date.now();
        await this.store.set(['logs', timestamp], messagePair);
        return messagePair
    }

    // updates the chat summary with buffered messages
    summarizeChatHistory() {

        const summarizerPrompt = `
            You are a helpful and insightful AI text summarizer with an IQ of 125.
            You are able to summarize long conversations betweens humans and AI assistants.
            Your goal is to summarize our entire conversation in a way that is both accurate and concise.
            This summary will become the long-term memory of an AI assistant.

            ${this.getChatSummary()}
            ${this.getRecentMessages()}

            Please extend the current summary based on our most recent messages.
            Make sure to retain a summary of our full conversation history.
            Ensure the summary is smaller than ${this.conversatationSummarySize} tokens
            `;

        console.log(`Summarizer prompt: ${summarizerPrompt}`);

        const chatBufferSize = this.chatBuffer.length;
        this.chatLLM(summarizerPrompt).then(async (summary) => {
            console.log(`Chat Summary: ${summary}`)
            this.chatSummary = summary;
            await this.store.set(['summary'], summary);
            this.chatBuffer.splice(0, chatBufferSize);
        });
    }

    // if summarizing, return the current summary
    getChatSummary(): string {

        const summary = `
            Below is the current summary of the chat history with your human:
            --summary--
            ${this.chatSummary? this.chatSummary : `No history to summarize yet.`}
            --summary--
            `;
        return this.summarizeChat ? summary : ``;
    }

    // if buffering, return the most recent (unsummarized) messages 
    getRecentMessages(): string {

        const recentMessages = `
            Here are the most recent messages exchanged with your human:
            --messages--
            ${this.chatBuffer.join('\n')}
            --messages--
            `;

        return this.bufferChat ? recentMessages : ``;
    }

    // add arbitrary context to a prompt (i.e. a conversation summary) before sending to a model
    injectContext(prompt: string) {
        const message = `
            ${role}
            ${this.getChatSummary()}
            ${this.getRecentMessages()}
            ${guidelines}
            ${prompt}
        `
        return message;
    }

    // call the model API service and stream the response
    async streamLLM(prompt: string) {
        const model = this.primaryModel;
        const endpoint = `http://localhost:8000/stream/${model}/${prompt}`
        const response = await fetch(endpoint);
        return response
    }

    // call the model API service, and return the full response
    async chatLLM(prompt: string) {
        const model = this.secondaryModel;
        const endpoint = `http://localhost:8000/chat/${model}/${prompt}`
        const response = await fetch(endpoint);    
        const json = await response.json();
        const content = json.message.content;
        return content;
    }

    public static async get_config() {
        const yaml_config = YAML.parse(fs.readFileSync('./config.yml', 'utf8'))
        const config: IConfig = {
            name: yaml_config.name,
            primaryModel: yaml_config.primaryModel,
            secondaryModel: yaml_config.secondaryModel,
            memory: yaml_config.memory,
        }
        return config
    }

    async spawnAgent(config: IConfig, objective: string): Promise<string | void>{
        const objective_prompt = 
        `You are an AI task planning agent that creates new tasks based on the following objective:
         ${objective}.
	    As a planning agent, diving objective into separate subtasks and order them properly 
        to ensure that objective is reached correctly. 
	    Return the task list as a JavaScript-like array.`

        const model = this.secondaryModel;
        const endpoint = `http://localhost:8000/chat/${model}/${objective_prompt}`;
      

        try{
            const response = await fetch(endpoint); 
            const {message} = await response.json();
            const list_of_tasks = JSON.parse(message.content);
            // for the speed, we will use only first two tasks from the list 
            const list_of_tasks_for_testins=[list_of_tasks[0], list_of_tasks[1]]
            let summary = "";
        
            await Promise.all(list_of_tasks_for_testins.map(async (task: string, i: number) => {
                const task_solution = await this.chatLLM(task);
                summary += `Step${i+1} - ${task_solution}, `;
            }));
            console.log('summary', summary);
            return summary; 
        }catch(e){
            console.log(e);
        }
      
    }
}