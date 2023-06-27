import { IConfig } from "./interfaces.ts";
import * as proc from "https://deno.land/x/proc@0.20.28/mod3.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { estimateTokens } from "./runtime/utils/utils.ts";

export class Sapial {
    public readonly name: string;
    public readonly primaryModel: string;
    public readonly secondaryModel: string;
    private readonly contextSize = 16_384;
    private readonly conversatationSummarySize = 4_096;
    private readonly messageBufferSize = 4_096;
    private store: Deno.Kv;

    constructor(config: IConfig, store: Deno.Kv ) {
        this.name = config.name;
        this.primaryModel = config.primaryModel;
        this.secondaryModel = config.secondaryModel;
        this.store = store;
        
        // setup the proxy server
        const handler = async (request: Request) => {
            const humanMessage = await request.text();
            // const humanMessageWithContext = await this.onMessageRequest(humanMessage);
            // const response = await this.streamLLM(humanMessageWithContext);
            // response.text().then(async (AIMessage) => {
            //     await this.onMessageResponse(humanMessage, AIMessage);
            // });
            const stream = await this.streamLLM(humanMessage);
            const { readable, writable } = new TransformStream<Uint8Array>;
            stream.body!.pipeTo(writable);

            return new Response(readable);
        };

        serve(handler, { port: 4242 });
    }

    // create a new root sapial agent from a new config object
    public static async init(config: IConfig) {

        // start the uvicron API server for python services
        proc.run("bash", "run.sh");    
        console.log("Started API service");

        const store = await Deno.openKv();

        // create the sapial agent
        const sapial = new Sapial(config, store);
        return sapial;
    }

    // contextualizes a human message with the conversation history
    async onMessageRequest(humanMessage: string) {
        // get the context
        const chatSummary = await this.store.get(['summary']);
        const messageBuffer = await this.store.get(['buffer']);
        const contextualizedMessage = `
            You are a helpful AI assistant with an IQ of 115.\n

            Below is a summary of your chat history with your human.\n
            --- Begin Summary -- \n 
            ${chatSummary}\n
            --- End Summary --- \n\n 

            In addition, here are the most recent messages with your human:\n
            --- Begin Recent Messages --- \n
            ${messageBuffer} \n
            --- End Recent Messages --- \n\n

            Here is the latest message from your human: \n
            Before answering, consider the prior conversaton. \n
            Let's think step-by-step, and explain our rationale for our answers. \n
            ${humanMessage}
        `;

        return contextualizedMessage
    }

    // takes the AI response and updates the conversation history
    async onMessageResponse(humanMessage: string, AIMessage: string) {

        // create a new message pair
        const convo = `
            Human Question: ${humanMessage} \n
            AI Answer: ${AIMessage}
        `

        // update the logs
        const log = await this.store.get(['log']);
        let newLog;

        if (Array.isArray(log)) {
            newLog = log.push(convo);
        } else {  
            newLog = [convo];   
        }

        await this.store.set(['log'], newLog); 
        
        // update the buffer
        const buffer = await this.store.get(['buffer']);
        let newBuffer;

        if (Array.isArray(buffer)) {
            newBuffer = buffer.push(convo);
        } else {
            newBuffer = [convo];
        }

        await this.store.set(['buffer'], newBuffer);

        // create a new summary
        const summary = await this.store.get(['summary']);
        let newSummary;

        const summaryPrompt = `
            You are a helpful and insightful AI text summarizer with an IQ of 125.\n
            You are able to summarize conversations betweens humans and AI assistants.\n
            Your goal is to summarize the conversation in a way that is both accurate and concise.\n
            This summary will become the memory of the AI assistant.\n

            Below is a summary of your chat history with your human.\n
            --- Begin Summary -- \n
            ${summary}\n
            --- End Summary --- \n\n

            In addition, here are the most recent messages with your human:\n
            --- Begin Recent Messages --- \n
            ${buffer} \n
            --- End Recent Messages --- \n\n

            Please update the summary based on the most recent messages.\n
            Ensure the summary is smaller than ${this.conversatationSummarySize} tokens.\n
        `;

        const summaryResponse = this.chatLLM(summaryPrompt).then( async (response) => {
            newSummary = response.json();
            await this.store.set(['buffer'], []);
            await this.store.set(['summary'], newSummary);
        });        
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
        console.log(`Agent Message: ${content}`);
        return content;
    }
}